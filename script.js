
var YEARS = 2017;
var barChartData = {
	type: 'bar',
	data: {
		labels: [ "2017", "2018", "2019", "2020", "2021" ],
		datasets: [{
				label: "$0 Contributions",
				borderColor: "#04275e",
				backgroundColor: "#4180e2",
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
	}
};
window.onload = function() {
	var ctx = document.getElementById("myChart").getContext("2d");
	new Chart(ctx, barChartData);
	updateChart();
};

function updateChart()
{
	p = new Big(document.getElementById("principal_input").value);
	i = new Big(document.getElementById("interest_input").value);
	t = new Big(document.getElementById("time_input").value);
	if ( t.valueOf() == 0 )
		t = new Big(1);
	c = new Big(document.getElementById("cont_input").value);
	i = i.div(100);
	
	m = new Big(calculateMonthly(p, i ,t));
	//console.log((m.times(120)).valueOf());
	calculateLoan(p,i,t,m,c);
	
}

function calculateLoan(p,i,t,m,c)
{
	var withCont=[];
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
		if( run == true )
		{
			for(j = 0; j < 60; j++)
			{
				if( p.valueOf() < 0)
				{
					j = 60;
					
				}
				else
				{
					x = new Big( (p.times(i)).div(12) );
					y = new Big( (m).plus(c) );
					p = new Big(p.minus((y).minus(x)));
					totalInterest = totalInterest.plus( (m.plus(c)) );
					count++;
					//console.log("Month #" + count + " Principal: "+p.valueOf() +"in loop");
					if(count%11 == 0)
						withCont.push(p.valueOf());
				}	
			}
		}
		run = false;
		if( p.valueOf() > 0 )
		{
			x = new Big( (p.times(i)).div(12) );
			p = new Big((p).minus( (m).minus(x)));
			if( p < 0 )
			{
				p = new Big(0);
			}
			if(count%11 == 0)
				withCont.push(p.valueOf());
			totalInterest = totalInterest.plus(m);
			count++;
			//console.log("Month #" + count + " Principal: "+p.valueOf());
		}	
	}
	totalInterest = totalInterest.minus(pTemp);
	costOfLoan = pTemp.plus(totalInterest);
	if (c > 0)
		employeeCost = costOfLoan.minus(6000);
	else
		employeeCost = costOfLoan;
	
	console.log("Payment count = " + count);
	console.log("Interest paid = " + totalInterest.valueOf());
	console.log("Cost of Loan = " + costOfLoan.valueOf());
	console.log("Employee cost = " + employeeCost.valueOf());
	
	//remove the labels and datas
	barChartData.data.labels.splice(0, barChartData.data.labels.length);
	barChartData.data.datasets[0].data.splice(0, barChartData.data.datasets[0].data.length);
	barChartData.data.datasets[1].data.splice(0, barChartData.data.datasets[1].data.length);
	//add the labels
	for(time = 0; time < t; time++)
	{
		var x = (time+2017).toString();
		barChartData.data.labels.push(x);
	}
	
	//add the data to dataset 1
	for(data1 = 0; data1 < withCont.length; data1++)
	{
		console.log("Data1: " + withCont[data1]);
		barChartData.data.datasets[1].data.push(withCont[data1]);
	}
	
	//add the data to dataset 2
	var withoutCont = calcWithoutCont(m,t,i,pTemp);
	for(data2 = 0; data2 < withoutCont.length; data2++)
	{
		console.log("Data2: " + withoutCont[data2]);
		barChartData.data.datasets[0].data.push(withoutCont[data2]);
	}
	//update chart
	var ctx = document.getElementById("myChart").getContext("2d");
	new Chart(ctx, barChartData);
}

function calcWithoutCont(m,t,i,p)
{
	var res = [];
	for( k = 0; k < (t.times(12)); k++)
	{
		
		x = new Big( (p.times(i)).div(12) );
		p = new Big((p).minus( (m).minus(x))); 
		if(k % 11 == 0)
		{
			console.log("K = " + k);
			res.push(p.valueOf());
		}
	}
	return res;
}

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
