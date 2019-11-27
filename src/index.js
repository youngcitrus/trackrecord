
const request = require('request');
const client_id = '2ac94934ad554c1c86adad5ab47d1553'; // Your client id
const client_secret = 'fc3d2d3ece504bea8f552847bf0b5c44'; // Your secret

  document.addEventListener('DOMContentLoaded', () => {
  console.log('hi');

  const authOptions = {
      url: 'https://cors-anywhere.herokuapp.com/https://accounts.spotify.com/api/token',
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
          },
      form: {
        grant_type: 'client_credentials'
          },
      json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
  
      // use the access token to access the Spotify Web API
      var token = body.access_token;
      var options = {
        url: 'https://cors-anywhere.herokuapp.com/https://api.spotify.com/v1/browse/new-releases?limit=50',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        json: true
      };
      request.get(options, function(error, response, body) {
        body.albums.items.forEach(album => {console.log(album)})
        const svg = d3.select("#test").append("svg")
          .attr("width", 400)
          .attr("height", 400)
        const rectangle = svg.append("rect")
          .attr("x", 200)
          .attr("y", 200)
          .attr("width", 70)
          .attr("height", 70)
          .attr("fill", "black")
        
      });
    }
  });
});