var tb = document.getElementById('amorWithContTable').getElementsByTagName('tbody')[0];
// Dataset information about the chart
var barChartData = {
	type: 'bar',
	data: {
		labels: [ "2017", "2018", "2019", "2020", "2021" ],
		datasets: [{
				label: "$0 Contributions",
				borderColor: "#04275e",
				backgroundColor: "#0306ad",
				borderWidth: 1,
				data: [ 20,12,11,6,5,1],
			}, {
				label: "$100 Contributions",
				borderColor: "#1a53af",
				backgroundColor: "#85b2f7",
				borderWidth:1,
				data: [ 18, 16, 9, 4, 3, 2, 0],
			}]
	},
	options: {
		responsive: true,
		title:{
			display:true,
			text: "Loan Benefit Visualization"
		},
		legend: {
			position: 'top',
		},
		scales: {
			yAxes: [{
			  scaleLabel: {
				display: true,
				labelString: 'Total Loan Cost Remaining'
			  }
			}],
			xAxes: [{
			  scaleLabel: {
				display: true,
				labelString: 'Term Year'
			  }
			}]
		},     
	}
};

// Update chart when the website first loads
window.onload = function() {
	var ctx = document.getElementById("myChart").getContext("2d");
	new Chart(ctx, barChartData);
	updateChart();
};

// First function entered when values change in the input boxes
function updateChart()
{
	p = new Big(document.getElementById("principal_input").value);
	i = new Big(document.getElementById("interest_input").value);
	t = new Big(document.getElementById("time_input").value);
	if ( t.valueOf() == 0 )
		t = new Big(1);
	c = new Big(document.getElementById("cont_input").value);
	cc = new Big(document.getElementById("cap_input").value);
	i = i.div(100);
	
	m = new Big(calculateMonthly(p, i ,t));
	while(tb.rows.length > 0) {
	  tb.deleteRow(0);
	}
	calculateLoan(p,i,t,m,c,cc);
	
}

function insertRow(month,cont,pay,intrst,prin,loan)
{
	var newRow = tb.insertRow(tb.rows.length);
	for(y = 0; y < 6; y++)
	{
		newRow.insertCell(y);
	}
	newRow.cells[0].innerHTML = month;
	newRow.cells[1].innerHTML = "$"+numberWithCommas(Math.round(cont));
	newRow.cells[2].innerHTML = "$"+numberWithCommas(Math.round(prin));
	newRow.cells[3].innerHTML = "$"+numberWithCommas(Math.round(intrst));
	newRow.cells[4].innerHTML = "$"+numberWithCommas(Math.round(pay));
	newRow.cells[5].innerHTML = "$"+numberWithCommas(Math.round(loan));
}

// Calculates both the with/without and stores data to table and graph chart.
function calculateLoan(p,i,t,m,c,cc)
{
	var withCont=[];
	var tb = document.getElementById('amorWithContTable').getElementsByTagName('tbody')[0];
	
	totalInterest = new Big(0);
	costOfLoan = new Big(0);
	employeeCost = new Big(0);
	pTemp = new Big(p);
	count = 0;
	var run = false;
	if ( c > 0 )
		run = true;
	while(p.valueOf() > 0)
	{
		temp = new Big(p);
		
		if( run == true )
		{
			for(j = 0; j < (cc/c); j++)
			{
				if( p.valueOf() < 0.01)
				{
					p = new Big(0);
					run = false;
					c = new Big(0);
					break;
				}
				else
				{
					x = new Big( (p.times(i)).div(12) );
					y = new Big( (m).plus(c) );
					p = new Big(p.minus((y).minus(x)));
					totalInterest = totalInterest.plus( (m.plus(c)) );
					count++;
					if(p.valueOf() < 0)
						p = new Big(0);
					insertRow(count,c,(y).minus(x),(p.times(i)).div(12),(c.plus((m.plus(((p.times(i)).div(12)))))).minus((p.times(i)).div(12)),p.valueOf());
					console.log("L Month #" + count + " Principal "+temp+"-Payment: ("+c.plus((m.plus(((p.times(i)).div(12)))))+") "+"="+p.valueOf());
					//console.log("LMonth #" + count + " Principal "+temp+"-Payment: ("+c+"+"+m+"-"+(((p.times(i)).div(12))+") "+"="+p.valueOf())); //Principal: "+p.valueOf() + " monthly " + y.valueOf() + " in loop");
					if(count%11 == 0)
						withCont.push(p.valueOf());
				}	
			}
			run = false;
			c = new Big(0);
		}
		else if( p.valueOf() > 0 )
		{
			x = new Big( (p.times(i)).div(12) );
			p = new Big((p).minus( (m).minus(x)));
			if( p < 0 )
			{0
				p = new Big(0);
			}
			if(count%11 == 0)
				withCont.push(p.valueOf());
			totalInterest = totalInterest.plus(m);
			count++;
			insertRow(count,0,m.minus(x),(p.times(i)).div(12),(m.plus(((p.times(i)).div(12)))).minus((p.times(i)).div(12)),p.valueOf());
			console.log("Month #" + count + " Principal "+temp+"-Payment: ("+m.plus(((p.times(i)).div(12)))+") "+"="+p.valueOf());
			//console.log("Month #" + count + " Principal "+temp+"-Payment: ("+m+"-"+(((p.times(i)).div(12))+") "+"="+p.valueOf()));
			//console.log("Month #" + count + " Principal: "+p.valueOf()+ " monthly " + y.valueOf());
		}	
	}
	totalInterest = totalInterest.minus(pTemp);
	costOfLoan = pTemp.plus(totalInterest);
	if (c > 0)
	{
		employeeCost = costOfLoan.minus(6000);
	}
	else
	{
		employeeCost = costOfLoan;
		if(employeeCost < 0)
			employeeCost = 0;
	}
	
	/* console.log("Payment count = " + count);
	console.log("Interest paid = " + totalInterest.valueOf());
	console.log("Cost of Loan = " + costOfLoan.valueOf());
	console.log("Employee cost = " + employeeCost.valueOf()); */
	
	var woTotalInterest = (m.times((t.times(12)))).minus(pTemp);
	var woCostOfLoan = (m.times((t.times(12))));
	var woEmployee = (m.times((t.times(12))));
	var woCount = (t.times(12));
	var woTime = 0;
	var timeSavedYears = Math.round(((t.times(12)).minus(count)).div(12));
	var timeSavedMonths = (((t.times(12)).minus(count)).mod(12)).toFixed(0);
	if (timeSavedYears < 0)
		timeSavedYears = 0;
	if (timeSavedMonths < 0)
		timeSavedMonths = 0;
	var timeSaved = ""+timeSavedYears + " yr(s) " + "and " + timeSavedMonths + " month(s)";
	var arrWithContributions = [ pTemp, totalInterest, costOfLoan, employeeCost, count, timeSaved];
	var arrWithoutContributions = [ pTemp, woTotalInterest, woCostOfLoan, woEmployee, woCount, woTime];
	insertToTable(arrWithContributions, 2);
	insertToTable(arrWithoutContributions, 1);
	
	//remove the labels and datas
	barChartData.data.labels.splice(0, barChartData.data.labels.length);
	barChartData.data.datasets[0].data.splice(0, barChartData.data.datasets[0].data.length);
	barChartData.data.datasets[1].data.splice(0, barChartData.data.datasets[1].data.length);
	//add the labels
	for(time = 0; time <= t.plus(1); time++)
	{
		var x = (time+2017).toString();
		barChartData.data.labels.push(x);
	}
	
	//add the data to dataset 1
	for(data1 = 0; data1 < withCont.length; data1++)
	{
		//console.log("Data1: " + withCont[data1]);
		barChartData.data.datasets[1].data.push(withCont[data1]);
	}
	
	//add the data to dataset 2
	var withoutCont = calcWithoutCont(m,t,i,pTemp);
	for(data2 = 0; data2 < withoutCont.length; data2++)
	{
		//console.log("Data2: " + withoutCont[data2]);
		barChartData.data.datasets[0].data.push(withoutCont[data2]);
	}

	//update chart
	var ctx = document.getElementById("myChart").getContext("2d");
	new Chart(ctx, barChartData);
}

// Insert values to the with/without table
function insertToTable(array, row)
{
	var table = document.getElementById('chartTable');
	if( row == 1 )
		table.rows[row]
	for( i = 0; i < array.length; i++)
	{
		if(i == 4)
			table.rows[row].cells[i+1].innerHTML = array[i];
		else if(i == 5)
			table.rows[row].cells[i+1].innerHTML = array[i];
		else
			table.rows[row].cells[i+1].innerHTML = ("$" + numberWithCommas(Math.round(array[i])));
	}
}

// Edits digits to display correct comma placement
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Calculate the principal balance per month and return array
function calcWithoutCont(m,t,i,p)
{
	var res = [];
	var count = (t.times(12));
	for( k = 0; k < count; k++)
	{
		x = new Big( (p.times(i)).div(12) );
		p = new Big((p).minus( (m).minus(x))); 
		if(k == count-1)
		{
			//console.log("K="+k+"p.valueOf()="+p.valueOf());
			res.push(Big(0));
		}
		else if(k % 11 == 0)
		{
			//console.log("K="+k+"p.valueOf()="+p.valueOf());
			res.push(p.valueOf());
		}
	}
	return res;
}

// Calculate the cost per month
function calculateMonthly(p,i,t)
{
								// (p * (i / 12)
	// monthly payment = ---------------------------
						// (1 - (12 / 12 + r)^(12*t) )
	y = new Big(12);
	numerator = new Big( (p).times( ((i).div(y)) ));
	x = new Big( y.div(y.plus(i)));
	z = new Big( y.times(t) );
	denominator = new Big( Big(1).minus(Math.pow(x.valueOf(), z.valueOf())));
	m = new Big ( (numerator).div(denominator) );
	
	return m;
}
