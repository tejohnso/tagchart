$(document).ready(function() {
  "use strict";
  var tagsList, tagsArray, bubbleChart, tooltipTimeout;

  $(document).on('replace', reloadDynamicHTML);

  function reloadDynamicHTML() {
    $(document).foundation($('#dataTable'));
    setEventHandlers();

    function setEventHandlers() {
      $('#topbar').on('click', function() {location.reload();});
      $('#tagHeader').on('click', function() {sortTags(); populateTable();});
      $('#countHeader').on('click', function() {sortCounts(); populateTable();});
      $('#dataChart').on('click', function(event) {
         var dataItem = bubbleChart.objectAtPoint(event.offsetX, event.offsetY);
         if (Object.keys(dataItem).length === 0) {return;}
         highlightRow(dataItem.label);
         addTooltip(dataItem, event);
      });
    }
  }

  $(document).foundation({tab:{callback:reload}});

  $(document.forms[0]).on('submit', function() { $('#go').click(); return false; });
  $('#go').on('click', reload);
  $('#theurl').focus();

  function reload() {
    if ($('#theurl').val() === '') {return;}
    $('#countHeader').html('Count');
    $('#tagHeader').html('TAG');
    $.when(populateTagCountsFromURL()).done(function() {
      setTagsArray();
      sortCounts();
      populateTable();
      clearVis();
      populateVis();
    });
    return false;
  }

  function populateTagCountsFromURL() {
    var defer = jQuery.Deferred();
    tagsList = {};
    toggleInputDisabled();
    if ($('#theurl').val().substr(0,4) !== 'http') {
      $('#theurl').val('http://' + $('#theurl').val());
    }

    $.post('/fetchData', {"url": $('#theurl').val()}, function(data) {
      iterateHTMLData(data.split('\n'));
      toggleInputDisabled();
      defer.resolve();
    });

    function iterateHTMLData(elements) {
      if (!elements) {return;}
      elements.forEach(function(val) {
        var countAndTag = val.split(' ');
        tagsList[countAndTag[1]] = Number(countAndTag[0]);
      });
    }

    function toggleInputDisabled() {
      var currentlyDisabled = $('#go').prop('disabled');
      $('#go, #theurl').prop('disabled', currentlyDisabled ? false : true);
    }

    return defer.promise();
  }

  function setTagsArray() {
    tagsArray = [];
    Object.keys(tagsList).forEach(function(val) {
      tagsArray.push([val, tagsList[val]]);
    });
  }

  function sortCounts() {
    if ($('#countHeader').html().substr(7, 1) === '-') {
      tagsArray.sort(function(a, b) { return (a[1] - b[1]); });
      $('#countHeader').html('Count [+]');
      $('#tagHeader').html('TAG');
    } else {
      tagsArray.sort(function(a, b) { return (b[1] - a[1]); });
      $('#countHeader').html('Count [-]');
      $('#tagHeader').html('TAG');
    }
  }

  function sortTags() {
    if ($('#tagHeader').html().substr(5, 1) === '-') {
      tagsArray.sort(function(a, b) { return (b[0] > a[0] ? 1 : -1); });
      $('#tagHeader').html('TAG [+]');
      $('#countHeader').html('Count');
    } else {
      tagsArray.sort(function(a, b) { return (b[0] > a[0] ? -1 : 1); });
      $('#tagHeader').html('TAG [-]');
      $('#countHeader').html('Count');
    }
  }

  function populateTable() {
    $('#dataTableBody').html('');
    tagsArray.forEach(function(val) {
      $('#dataTableBody').append($('<tr><td>' +
          val[0] + '</td><td>' + val[1] + '</td></tr>'));
    });
  }

  function highlightRow(tag) {
    $('#dataTableBody').find('td').removeClass('highlight');
    $('#dataTableBody').find('td').each(function() {
      if ($(this).html() === tag) {$(this).addClass('highlight');}
    });
  }

  function addTooltip(data, event) {
    var tooltip = document.createElement('div');

    tooltip.id = 'tooltip';
    tooltip.style.top = event.clientY + 'px';
    tooltip.style.left = event.clientX + 'px';
    tooltip.className = 'tooltip';
    tooltip.innerHTML = '<div>' + data.label + '</div><div>' + data.value + '</div>';
    if (document.getElementById('tooltip')) {
      document.body.removeChild(document.getElementById('tooltip'));
    }
    if (typeof tooltipTimeout !== 'undefined') {clearTimeout(tooltipTimeout);}
    document.body.appendChild(tooltip);
    tooltipTimeout = setTimeout(function() {
      $('#tooltip').fadeOut(500, function() {
        this.remove();
      });
    }, 1000);
  }

  function populateVis() {
    var ctx;

    if (Object.keys(tagsList).length === 0) {return;}
    if (document.getElementById('dataChartCanvas').width === 0) {return;}

    ctx = document.getElementById('dataChartCanvas').getContext('2d');

    var chartData = [];

    Object.keys(tagsList).map(function(val) {
      var newPieSlice = {"value": tagsList[val]
                        ,"color": '#' + (Math.random() * 0xFFFFFF<<0).toString(16)
                        ,"label": val};

      chartData.push(newPieSlice);
    });

    bubbleChart = new Chart(ctx).Pie(chartData);
  }

  function clearVis() {
    var width = document.getElementById('dataChart').clientWidth;
    $('#dataChart').html('');
    $('#dataChart').html('<canvas id="dataChartCanvas" width="' + width +
                          '" height="' + width + '"></canvas>');
  }
});
