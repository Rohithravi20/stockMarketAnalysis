async function chart(StocksName, duration) {
  try {
    let chart = await fetch('https://stocksapi-uhe1.onrender.com/api/stocks/getstocksdata');
    if (!chart.ok) throw new Error('Failed to Fetch');
    chart = await chart.json();

    const stocksData = chart.stocksData.find(stock => stock[StocksName]);
    if (!stocksData || !stocksData[StocksName]) {
      console.error(`Stock data for ${StocksName} not found.`);
      return;
    }

    const selectedStocks = stocksData[StocksName][duration];
    if (!selectedStocks) {
      console.error(`Duration ${duration} not available for ${StocksName}`);
      return;
    }

    const values = selectedStocks.value; 
    const timestamps = selectedStocks.timeStamp.map(ts => new Date(ts * 1000)); 

    const trace = {
      x: timestamps,
      y: values,
      type: 'scatter',
      mode: 'lines+markers',
      name: `${StocksName} (${duration})`,
      line: { color: '#00FF9C', width: 2 },
      marker: { size: 10, color: '#E9FF97' }
    };

    const layout = {
      title: {
        text: `${StocksName} Stock Prices (${duration})`,
        font: { color: 'white' }
      },
      xaxis: {
        title: { text: 'Time', font: { size: 16, color: 'white' } },
        tickfont: { size: 12, color: 'white' },
        tickformat: '%b %Y'
      },
      yaxis: {
        title: { text: 'Price (USD)', font: { size: 16, color: 'white' } },
        tickfont: { size: 12, color: 'white' }
      },
      height: 500,
      width: 800,
      paper_bgcolor: "#295F98",
      plot_bgcolor: '#295F98'
    };

    Plotly.newPlot('my_chart', [trace], layout); 
    
  } catch (error) {
    console.error('Error Rendering the Chart:', error);
  }
}
chart('AAPL', '1y'); 

const listSec = document.getElementById('List_section');

async function fetchStockData() {
  try {
    const response = await fetch('https://stocksapi-uhe1.onrender.com/api/stocks/getstockstatsdata');
    const data = await response.json();

    const stocksData = data.stocksStatsData[0];

    const listEle = document.createElement('ul');
    listEle.classList.add('ul_list');

    Object.keys(stocksData).forEach(company => {
      if (company === "_id") return;
      const stockDetails = stocksData[company];
      const listItem = document.createElement('li');
      const listDiv = document.createElement('div');
      listDiv.classList.add("listDiv");
      const buttonEle = document.createElement('button');

      buttonEle.textContent = company;
      buttonEle.value = company;
      buttonEle.classList.add('stocks_botton');
      const pEle1 = document.createElement('p');
      pEle1.textContent = `${stockDetails.bookValue}$ `;
      const pEle2 = document.createElement('p');
      pEle2.textContent = `${stockDetails.profit}%`;

      buttonEle.addEventListener('click', async (event) => {
        const company = event.target.value;
        await chart(company, '1y');
        await description(company, stockDetails.bookValue, stockDetails.profit);
        await durationBtns(company);
      })
      listDiv.appendChild(buttonEle);
      listDiv.appendChild(pEle1);
      listDiv.appendChild(pEle2);
      listItem.appendChild(listDiv);

      listEle.appendChild(listItem);
    })
    listSec.appendChild(listEle)

  } catch (error) {
    console.error('Error fetching stock data:', error);
  }
}
fetchStockData();

async function description(company, bookValue, profit) {
  try {
    const response = await fetch('https://stocksapi-uhe1.onrender.com/api/stocks/getstocksprofiledata');
    if (!response.ok) throw new Error('Failed to fetch company profile data');
    const data = await response.json();

    console.log(data.stocksProfileData);
    const selCompanyProfile = data.stocksProfileData.find(profile => profile[company]);
    if (!selCompanyProfile) {
      console.error(`Profile data for ${company} not found.`);
      data.stocksProfileData.forEach(profile => console.log(Object.keys(profile)[0]));
      return;
    }

    const selCompany = selCompanyProfile[company];

    const detailsEle = document.getElementById('Details_section');
    detailsEle.innerHTML = '';

    const details = document.createElement('div');
    details.innerHTML = `
        <div id="d-Head">
            <h4>Company: ${company}</h4>
            <h4>Book Value: ${bookValue}$</h4>
            <h4>Profit: ${profit}%</h4>
        </div>
        <p><strong>Summary:</strong> ${selCompany.summary}</p>
    `;
    detailsEle.appendChild(details);
  } catch (error) {
    console.error('Error fetching or displaying company description:', error);
  }
}

function durationBtns(company) {
  const ButtonsName = ["5y", "1y", "1mo", "3mo"];
  const buttonSec = document.getElementById('chart_sec');

  let existingDiv = document.querySelector('.BtnsDiv');
  if (existingDiv) {
    return;
  }

  const CreateDiv = document.createElement('div');
  CreateDiv.classList.add('BtnsDiv');

  ButtonsName.forEach((value) => {
    const buttons = document.createElement('button');
    buttons.classList.add('durationBtn');
    buttons.value = value;
    buttons.textContent = value;
    buttons.addEventListener("click", (event) => {
      chart(company, event.target.value);
    });
    CreateDiv.appendChild(buttons);
  });

  buttonSec.appendChild(CreateDiv);
}
