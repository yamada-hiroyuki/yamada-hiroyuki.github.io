// Initialize the Leaflet map
const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 2,
  });
  
  // Set bounds for your static map image
  const bounds = [[0, 0], [1000, 1000]];
  const image = L.imageOverlay('data/images/us.svg', bounds).addTo(map);
  map.fitBounds(bounds);
  
  // Restrict the map's panning to the bounds of the image
  map.setMaxBounds(bounds);
  
  // Flight track data
  const flightTrack = [
    { x: 200, y: 800, img: '/data/images/image1.jpg', text: 'View over New York.' },
    { x: 500, y: 600, img: '/data/images/image2.jpg', text: 'Flying near Philadelphia.' },
    { x: 800, y: 300, img: '/data/images/image3.jpg', text: 'Beautiful skies over Maryland.' }
  ];
  
  // Variable to track the open info box
  let activePoint = null;
  
  // Add points to the map
  flightTrack.forEach(point => {
    const marker = L.circleMarker([point.y, point.x], {
      radius: 5,
      color: 'red',
    }).addTo(map);
  
    // Mouseover event
    marker.on('mouseover', (event) => {
      if (activePoint !== marker) {
        const infoBox = document.getElementById('info-box');
        const infoImage = document.getElementById('info-image');
        const infoText = document.getElementById('info-text');
        
        infoBox.style.display = 'block';
        infoBox.style.left = `${event.originalEvent.pageX + 10}px`;
        infoBox.style.top = `${event.originalEvent.pageY - 50}px`;
        infoImage.src = point.img;
        infoText.textContent = point.text;
      }
    });
  
    // Mouseout event
    marker.on('mouseout', () => {
      if (activePoint !== marker) {
        document.getElementById('info-box').style.display = 'none';
      }
    });
  
    // Click event to keep the info box open
    marker.on('click', (event) => {
      activePoint = marker;
  
      const infoBox = document.getElementById('info-box');
      const infoImage = document.getElementById('info-image');
      const infoText = document.getElementById('info-text');
  
      infoBox.style.display = 'block';
      infoBox.style.left = `${event.originalEvent.pageX + 10}px`;
      infoBox.style.top = `${event.originalEvent.pageY - 50}px`;
      infoImage.src = point.img;
      infoText.textContent = point.text;
    });
  
    // Map click to close the info box
    map.on('click', () => {
      activePoint = null;
      document.getElementById('info-box').style.display = 'none';
    });
  });
  