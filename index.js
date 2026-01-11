async function renderChart(stockName, duration) {
  try {
    const response = await fetch(
      'https://stocksapi-uhe1.onrender.com/api/stocks/getstocksdata'
    );
    if (!response.ok) throw new Error('Failed to fetch chart data');

    const data = await response.json();
    const stock = data.stocksData.find(item => item[stockName]);
    if (!stock) return;

    const stockInfo = stock[stockName][duration];
    const values = stockInfo.value;
    const timestamps = stockInfo.timeStamp.map(t => new Date(t * 1000));

    const trace = {
      x: timestamps,
      y: values,
      type: 'scatter',
      mode: 'lines',
      line: { width: 2 }
    };

    Plotly.newPlot('my_chart', [trace], {
      title: `${stockName} Stock Price (${duration})`,
      paper_bgcolor: '#295F98',
      plot_bgcolor: '#295F98',
      responsive: true
    });

  } catch (err) {
    console.error(err);
  }
}

