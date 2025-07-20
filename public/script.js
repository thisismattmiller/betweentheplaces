
var points = []
var zoom = 6
let firstcut = true;
mapboxgl.accessToken = '<TOKEN>';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-79.4512, 43.6568],
    zoom: 6
});

var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl
});

function addPoint(p){  
    let li = document.createElement('li')
    li.innerHTML = p
    document.getElementById('points').append(li)
    
    setTimeout(()=>{li.style.opacity=1},10)
}

geocoder.on('result', function(r) {
  points.push(r.result.center)
  addPoint(r.result.center)
  geocoder.clear()
  
  
  if (points.length>2){
    
    document.getElementById('cutmap').style.opacity=1
    
  }
  
})

function reqImg(){
  
  let data = {
    points: points.join("|"),
    zoom: zoom,
    firstcut: firstcut,
  };
  
  if (!firstcut){
    delete data.firstcut
  }

  let searchParams = new URLSearchParams(data);

  let imgsrc = '/cutmap?' + searchParams.toString()
  
  
  document.getElementById('results-container').style.display='block'
  document.getElementById('building-image').style.display = 'block'

  document.getElementById('image-container').innerHTML=''
  let el = document.createElement('img')
  el.src = imgsrc
  document.getElementById('image-container').appendChild(el)

  el.addEventListener('load',function(){
    document.getElementById('building-image').style.display = 'none'
    
  })
  
  firstcut=false;
  
}


document.getElementById('download').addEventListener('click',()=>{
  
   
  let data = {
    points: points.join("|"),
    zoom: zoom,
    download:true
  };

  let searchParams = new URLSearchParams(data);

  let imgsrc = '/cutmap?' + searchParams.toString()
  window.location=imgsrc
  
})
document.getElementById('zoomin').addEventListener('click',()=>{
  
  if (zoom>=22){
    alert("TOO MUCH ZOOOOM")
    return false
  }
  
  
  zoom++
  reqImg()
  
})

document.getElementById('zoomout').addEventListener('click',()=>{
  
  if (zoom<=0){
    alert("TOO LITTLE ZOOOOM")
    return false
  }
  
  
  zoom = zoom -1
  reqImg()
  
})


document.getElementById('cutmap').addEventListener('click',()=>{
  
  reqImg()
  

  
})

document.getElementById('geocoder').appendChild(geocoder.onAdd(map));


  var canvas = document.getElementById('canvas'),
          context = canvas.getContext('2d');

  // resize the canvas to fill browser window dynamically
  window.addEventListener('resize', resizeCanvas, false);
  var canResize = true;

  function resizeCanvas() {
          if (canResize){
            

            canvas.width = window.innerWidth-20;
            canvas.height = document.body.scrollHeight;

            /**
             * Your drawings need to be inside this function otherwise they will be reset when 
             * you resize the browser window and the canvas goes will be cleared.
             */
            drawStuff(); 
            
            canResize = false
            
            
            setTimeout(()=>{
              canResize = true
            },5000)
          }
  }
  
  setTimeout(()=>{
    resizeCanvas();
  },500)


  function getRandomArbitrary(min, max) {
      return Math.random() * (max - min) + min;
  }


  function drawPoly(c,posx,posy){
    c.fillStyle = '#fff';
    c.beginPath();
    c.moveTo(posx, posy);
    
    if (parseInt(getRandomArbitrary(0,10)) <5 ){
      c.lineTo(posx+getRandomArbitrary(0,100), posy+getRandomArbitrary(0,100));
      c.lineTo(posx+getRandomArbitrary(0,100),posy+getRandomArbitrary(0,100));
      c.lineTo(posx+getRandomArbitrary(0,100), posy+getRandomArbitrary(0,100));      
    }else{
      c.lineTo(posx+getRandomArbitrary(0,100), posy+getRandomArbitrary(0,100));
      c.lineTo(posx+getRandomArbitrary(0,100),posy+getRandomArbitrary(0,100));
      c.lineTo(posx+getRandomArbitrary(0,100), posy+getRandomArbitrary(0,100));
      c.lineTo(posx+getRandomArbitrary(0,100), posy+getRandomArbitrary(0,100));      
    }
    

    c.closePath();
    c.strokeStyle = 'rgba(0,0,0,0.2)'
    c.stroke();
    c.fill();
    
    
  }
  function drawStuff() {

    var c = document.getElementById('canvas');
    var todraw = []
    if (c.getContext) {
      var c2 = c.getContext('2d');
      var width = c.width;
      var height = c.height;
      
      let polyHeight = 100
      let polyWidth = 100
      
      let cols = parseInt(width/polyWidth) + 1
      let  rows = parseInt(height/polyHeight) + 20
      
      
      for (var i = 0; i < rows; i++) {        
        for (var ii = 0; ii < cols; ii++) {
          let posx = ii * 100
          let posy = i * 100

          todraw.push([posx,posy])
          todraw.push([posx,posy])
          
          
          
          
        }
        
      }

      
      let counter = 10
      
      for (var i = 0; i < todraw.length; i++) { 
        
        let tdpos = parseInt(getRandomArbitrary(0,todraw.length))
        
        let td = todraw[tdpos]
        
        setTimeout(()=>{
          drawPoly(c2,td[0],td[1])
          
        }, counter)
        
        todraw.splice(tdpos, 1)
        
        counter=counter+10
        
        
      }
      
      
      
    }
    
    
    
    
    
  }
