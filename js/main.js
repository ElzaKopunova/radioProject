let c = document.getElementById('canvas');
let ctx = c.getContext('2d');
let arrayOfXandY = [];  

let btn = document.querySelector('.btn');
btn.addEventListener('click', downloadFile);

function insertDiv(massiv){  //отображение координат списком
    let outText = document.createElement('div');
    outText.innerHTML = '<p>Пары координат радиопередатчика:</p>';

    let div = document.createElement('div');
    div.className ='output-container';
    let output = [];
    for (let i = 0; i < massiv.length; i+=2){
        output.push('<li>', ` x = ${massiv[i]} `, ` y =  ${massiv[i+1]}`, '</li>');
    }
    div.innerHTML = '<ul>' + output.join('') + '</ul>';
    div.prepend(outText);
    let lascSection = document.querySelector('.container');
    lascSection.append(div);
}


function downloadFile(){
    if (window.File && window.FileReader && window.FileList && window.Blob){
        let files = document.getElementById('file').files;
        if (!files[0]) {   
            alert('Загрузите документ');
        } else {
            if (files[0].type == "text/plain"){
                let reader = new FileReader();
                reader.readAsText(files[0]);

                reader.onload =()=>{
                    function Coordinates(info){
                        const res = info.replace(/,\s\d\s[измерение]/, '').replace(/[^,\d;\n]/g, ''); //исключить слова из строки
                        const resulCoordinates = res.split(/,|;|\n/).map(Number);  //создаем массив всех считанных чисел
                        console.log(resulCoordinates)
                        return  resulCoordinates;
                    }
                    var arrayOfCoordinatis = Coordinates(reader.result);
                    const x1 = arrayOfCoordinatis[0];
                    const y1 = arrayOfCoordinatis[1];
                    const x2 = arrayOfCoordinatis[2];
                    const y2 = arrayOfCoordinatis[3];
                    const x3 = arrayOfCoordinatis[4];
                    const y3 = arrayOfCoordinatis[5];      
                    let data1 = [{ //данные для графика
                        x: x1,
                        y: y1,
                        r: 8
                    },
                    {
                        x: x2,
                        y: y2,
                        r: 8
                    },
                    {
                        x: x3,
                        y: y3,
                        r: 8
                    }];
                    const times = arrayOfCoordinatis.slice(6, arrayOfCoordinatis.length); 
                    
                    let getTimes = function(times){         //получаем массив, хранящий время пролета каждого сигнала
                        let arrayOfTimes = [];
                        for (let i = 0; i < times.length; i+=3){
                            if(times[i] != undefined && times[i+1] != undefined && times[i+2] != undefined){
                                arrayOfTimes.push([times[i], times[i+1], times[i+2]]);
                                }    
                            }
                        return arrayOfTimes;
                    }
                    let arrayOfTimes = getTimes(times);

                    var getXAndY = function(arrayOfTimes, callback){   //получаем x y 
                        for (let j = 0; j < arrayOfTimes.length; j++){
                            let t1 = arrayOfTimes[j][0];
                            let t2 = arrayOfTimes[j][1];
                            let t3 = arrayOfTimes[j][2];
                            console.log('t1 = ' + t1 + ' t2= ' + t2 + ' t3= ' + t3);
                            const e = 1e-5;  //погрешность для проверки
                            let x = 0;
                            let y = 0;
                            let v = 1000;   //скорость сигнала 
                            r1 = t1 * v;
                            r2 = t2 * v;
                            r3 = t3 * v;
                            x = ((y2 - y1) * (r2 * r2 - r3 * r3 - x2 * x2 + x3 * x3 - y2 * y2 + y3 * y3) - (y3 - y2) * (r1 * r1 - r2 * r2 - x1 * x1 + x2 * x2 - y1 * y1 + y2 * y2)) / (2 * ((y3 - y2) * (x1 - x2)  - (y2 - y1) * (x2 - x3)));
                            y = ((x2 - x1) * (r2 * r2 - r3 * r3 - x2 * x2 + x3 * x3 - y2 * y2 + y3 * y3) - (x3 - x2) * (r1 * r1 - r2 * r2 - x1 * x1 + x2 * x2 - y1 * y1 + y2 * y2)) / (2 * ((x3 - x2) * (y1 - y2)  - (x2 - x1) * (y2 - y3)));
                            if (Math.abs((x1 - x) * (x1 - x) + (y1 - y) * (y1 - y) - r1 * r1) < e && Math.abs((x2 - x) * (x2 - x) + (y2 - y) * (y2 - y) - r2 * r2) < e && Math.abs((x3 - x) * (x3 - x) + (y3 - y) * (y3 - y) - r3 * r3) < e){    // проверка
                                arrayOfXandY.push(x.toFixed(3), y.toFixed(3)); 
                            } else {
                                console.log(`координата (${x}, ${y}) не входит`);
                            }
                            // arrayOfXandY.push(x.toFixed(3), y.toFixed(3));
                        }
                        callback(data1, arrayOfXandY);
                    }                    
                    getXAndY(arrayOfTimes, function(data, massiv){    //строим график 
                        let dataTwo = []
                        for (let i = 0; i < massiv.length; i+=2){
                            let dataElement = { x : massiv[i], y: massiv[i+1]};
                            dataTwo.push(dataElement);
                        }
                        let myChart = new Chart(ctx, {
                            type: 'bubble',
                            data: {
                                datasets: [{
                                    label: 'Радиоприемник',
                                    backgroundColor: 'rgb(0, 155, 149)', 
                                    borderColor: 'rgb(0, 155, 149)', 
                                    data: data
                                },
                                {
                                    type: 'line',
                                    label: 'Радиопередатчик', 
                                    backgroundColor: 'transparent', 
                                    borderColor: 'rgb(255, 113, 0)', 
                                    data: dataTwo
                                }]
                            }
                        })
                            insertDiv(massiv); // отображаем данные в html
                    });
                }
                reader.onerror = function(){
                    console.log(reader.error);
                }
            } else {
                alert('Прикрепите файл формата ".txt"');
            }
        }
    }
}



