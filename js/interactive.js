const VALID_FREQUENCY_MAX = 12500;
const VALID_FREQUENCY_MIN = 80;

$('#ISMFreqsIsoButtom').click(function () {
  $('#ISMFreqs').children().removeClass('active');
  $(this).addClass('active');
  $('#ISMFreqsIsoSetting').removeClass('hide');
  $('#ISMFreqsCustomSetting').addClass('hide');
})

$('#ISMFreqsCostomButtom').click(function () {
  $('#ISMFreqs').children().removeClass('active');
  $(this).addClass('active');
  $('#ISMFreqsIsoSetting').addClass('hide');
  $('#ISMFreqsCustomSetting').removeClass('hide');
})

$('#ISMFreqsIsoSetting').children().click(function () {
  $('#ISMFreqsIsoSetting').children().removeClass('active');
  $(this).addClass('active');
})

$('#IMTest').click(function () {
  AUD.init();
  AUD.startSound(80, -15);
  $(this).addClass('hide');
  $('#IMStart').removeClass('hide');
})

$('#IMStart').click(function () {
  $('#ISM').modal('show');
  AUD.stopSound();
})

$('#ISMStart').click(function () {
  if (!$('#ISMFreqsIsoButtom').hasClass('active') && !$('#ISMFreqsCostomButtom').hasClass('active')) {
    alert('必须选择一个模式！');
    return;
  }
  if ($('#ISMFreqsIsoButtom').hasClass('active')) {
    if (!$('#ISMFreqsIsoSetting').children().hasClass('active')) {
      alert('必须选择一个ISO类型！');
      return;
    }
    if ($('#ISMFreqsIsoSetting10').hasClass('active')) {
      DefinedFreqs = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
    } else if ($('#ISMFreqsIsoSetting15').hasClass('active')) {
      DefinedFreqs = [25, 40, 63, 100, 160, 250, 400, 630, 1000, 1600, 2500, 4000, 6400, 10000, 16000];
    } else {
      DefinedFreqs = [16, 20, 26, 32, 41, 52, 66, 84, 105, 135, 170, 220, 280, 350, 440, 560, 720, 910, 1200, 1500, 1900, 2300, 3000, 3800, 4800, 6100, 7700, 10000, 12500, 16000, 20000];
    }
  } else {
    let str = $('#ISMFreqsCustomSetting').val();
    let strs = str.split(' ');
    if (strs.length <= 0) {
      alert('自定义的频段不合法!');
      return;
    }
    for (let i = 0; i < strs.length; i++) {
      strs[i] = Math.round(Number(strs[i]));
    }
    for (let i = 0; i < strs.length; i++) {
      if (typeof (strs[i]) !== 'number' || isNaN(strs[i]) || strs[i] < 16 || strs[i] > 20000) {
        alert('自定义的频段不合法!');
        return;
      }
    }
    DefinedFreqs = strs.sort((a, b) => {
      return a - b;
    });
  }
  $('#IM').addClass('hide');
  $('#ISM').modal('hide');
  $('#M').removeClass('hide');

  Init();
})

var APP = {
  progressChart: null,
  resultChart: null,
  init: function () {
    this.progressChart = new echarts.init(document.getElementById('MProgressChart'));
    this.resultChart = new echarts.init(document.getElementById('RMCurveChart'));
  },
  progressUpdate: function () {
    let newdata = [];
    for (let i = 0; i < Workflow.freqs.length; i++) {
      let lo = Workflow.status[Workflow.freqs[i]].lodb;
      let hi = Workflow.status[Workflow.freqs[i]].hidb;
      if (hi - lo >= LeastResolutionRange) newdata.push([hi, lo, hi, lo]);
      else newdata.push([lo, hi, lo, hi]);
    }
    let option = {
      xAxis: {
        data: DefinedFreqs
      },
      yAxis: {},
      series: [{
        type: 'k',
        data: newdata
      }]
    };
    $('#MProgressChart').css('width', window.innerWidth / 1.5 + 'px');
    $('#MProgressChart').css('height', window.innerHeight / 2 + 'px');
    $('#MProgressChart').css('text-align', 'center');
    $('#MProgressChart').css('margin', '0 auto');
    this.progressChart.resize();
    this.progressChart.setOption(option);
  },
  resultUpdate: function (name) {
    let tdic;
    if (name === '小白开水') tdic = TC0;
    else if (name === '大白开水') tdic = TC20;
    else if (name === 'Harman 0') tdic = HTC0;
    else tdic = HTC20;

    let tx = [], tlist = [], slist = [], mean = 0, meancount = 0;;
    for (let i = 16; i <= 20000; i = Math.ceil(Math.pow(i, 1.001))) tx.push(i);
    tx.push(20000);
    for (let i = 0; i < tx.length; i++) {
      tlist.push(tdic[tx[i]]);
    }
    /*

        // debug
        slist = [0, 0, 0, 0, 18, 18.4, 25.2, 32.8, 34.4, 42.6, 45.2, 46.1, 43.9, 35.8, 38.4, 40.9, 42.6, 45.9, 44.6, 39.8, 41.1, 41, 46.1, 50.7, 42.8, 38.9,
                 37.4, 40.9, 37.5, 23, 2.5];
        for(let i = 0; i < slist.length; i++)slist[i] = slist[i];
        DefinedFreqs = [16, 20, 26, 32, 41, 52, 66, 84, 105, 135, 170, 220, 280, 350, 440, 560, 720, 910, 1200, 1500, 1900, 2300, 3000, 3800, 4800, 6100, 7700, 10000, 12500, 16000, 20000];
        //debug
    */
    for (let i = 0; i < DefinedFreqs.length; i++) {
      let lo = Workflow.status[DefinedFreqs[i]].lodb;
      let hi = Workflow.status[DefinedFreqs[i]].hidb;
      slist.push(-(lo + hi) / 2);
    }
    for (let i = 0; i < DefinedFreqs.length; i++) {
      if (DefinedFreqs[i] >= VALID_FREQUENCY_MIN && DefinedFreqs[i] <= VALID_FREQUENCY_MAX) {
        mean += slist[i] - tdic[DefinedFreqs[i]];
        meancount++;
      }
    }
    mean /= Math.max(0, meancount);
    for (let i = 0; i < DefinedFreqs.length; i++) {
      slist[i] -= mean;
    }


    let option = {
      tooltip: {
        trigger: 'none',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: ['您的听觉曲线', '目标曲线']
      },
      xAxis: [
        {
          type: 'category',
          data: tx,
          axisPointer: {
            label: {
              formatter: function (params) {
                return '目标曲线 ' + params.value + (params.seriesData.length ? 'Hz ：' + params.seriesData[0].data.toFixed(1) : '');
              }
            }
          },
        },
        {
          type: 'category',
          data: DefinedFreqs,
          axisPointer: {
            label: {
              formatter: function (params) {
                return '您的结果 ' + params.value + (params.seriesData.length ? 'Hz ：' + params.seriesData[0].data.toFixed(1) : '');
              }
            }
          },
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: '目标曲线',
          type: 'line',
          xAxisIndex: 0,
          smooth: true,
          data: tlist
        },
        {
          name: '您的听觉曲线',
          xAxisIndex: 1,
          type: 'line',
          smooth: true,
          data: slist
        }
      ]
    };
    $('#RMCurveChart').css('width', window.innerWidth / 1.5 + 'px');
    $('#RMCurveChart').css('height', window.innerHeight / 2 + 'px');
    $('#RMCurveChart').css('text-align', 'center');
    $('#RMCurveChart').css('margin', '0 auto');
    this.resultChart.resize();
    this.resultChart.setOption(option);

    let eqpass = [], eqmax = 0;
    for (let i = 0; i < DefinedFreqs.length; i++) {
      eqpass.push(tdic[DefinedFreqs[i]] - slist[i]);
      if (DefinedFreqs[i] >= VALID_FREQUENCY_MIN && DefinedFreqs[i] <= VALID_FREQUENCY_MAX) {
        eqmax = Math.max(eqmax, eqpass[i]);
      }
    }
    if (eqmax > 15) {
      for (let i = 0; i < DefinedFreqs.length; i++) {
        eqpass[i] -= eqmax - 15;
      }
    }
    let str = '';
    str += '<table class="table">';
    str += '<thead><tr><th>频率</th>'
    for (let i = 0; i < DefinedFreqs.length; i++) {
      str += '<th>' + DefinedFreqs[i] + ' Hz</th>';
    }
    str += '</thead><tbody><tr><th>值</th>';
    for (let i = 0; i < DefinedFreqs.length; i++) {
      str += '<th>' + eqpass[i].toFixed(1) + ' dB</th>';
    }
    str += '</tr></tbody>';
    str += '</table>';
    str += '<div>Gain : ' + Math.max(-15, -eqmax).toFixed(1) + ' dB</div>'
    $('#RMEqTable').html(str);
  },
  end: function () {
    AUD.stopSound();
    $('#M').addClass('hide');
    $('#RM').removeClass('hide');
    document.onkeydown = function () {
    };
  }
}

function Init() {
  Workflow.init(DefinedFreqs);
  let test = Workflow.getTest();
  AUD.startSound(test.freq, test.db);
  APP.init();
  APP.progressUpdate();

  document.onkeydown = function (event) {
    var e = event || window.event || arguments.callee.caller.arguments[0];
    if (e && e.keyCode == 37) { // <-
      AUD.stopSound();
      Workflow.saveTest(true);
      let test = Workflow.getTest();
      if (test == null) {
        APP.end();
        return;
      }
      AUD.startSound(test.freq, test.db);
      APP.progressUpdate();
    }
    if (e && e.keyCode == 39) {// ->
      AUD.stopSound();
      Workflow.saveTest(false);
      let test = Workflow.getTest();
      if (test == null) {
        APP.end();
        return;
      }
      AUD.startSound(test.freq, test.db);
      APP.progressUpdate();
    }
  };
}

$('#Canhear').click(function () {
  AUD.stopSound();
  Workflow.saveTest(true);
  let test = Workflow.getTest();
  if (test == null) {
    APP.end();
    return;
  }
  AUD.startSound(test.freq, test.db);
  APP.progressUpdate();
})

$('#Cannothear').click(function () {
  AUD.stopSound();
  Workflow.saveTest(false);
  let test = Workflow.getTest();
  if (test == null) {
    APP.end();
    return;
  }
  AUD.startSound(test.freq, test.db);
  APP.progressUpdate();
})

$('#RMStandardSetting').children().children().click(function () {
  $('#RMStandardSetting').children().removeClass('active');
  $(this).parent().addClass('active');
  APP.resultUpdate($(this).html());
})
