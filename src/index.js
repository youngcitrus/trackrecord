
const request = require('request');
const client_id = '2ac94934ad554c1c86adad5ab47d1553'; // Your client id
const client_secret = 'fc3d2d3ece504bea8f552847bf0b5c44'; // Your secret

document.addEventListener('DOMContentLoaded', () => {
  console.log('hi');

  //request auth token from Spotify API

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
      // request 50 latest album/single releases

      let token = body.access_token;
      let options = {
        url: 'https://cors-anywhere.herokuapp.com/https://api.spotify.com/v1/browse/new-releases?limit=49',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        json: true
      };

      const tracks = [];
      const albums = [];

      request.get(options, function(error, response, body) {
        
        console.log(body);

        const svg = d3.select("#main").append("svg")
          .attr("width", 448)
          .attr("height", 448)

        const infoWindow = d3.select("#main").append("svg")
          .attr("width", 448)
          .attr("height", 448)
          .attr('x', 448)

        const svgText = infoWindow.append('text')
          .attr("x", 100)
          .attr("y", 200)
          .attr("font-family", "Roboto")
          .text("Mouseover an album image for details")

        const svgText2 = infoWindow.append('text')
          .attr("x", 100)
          .attr("y", 225)
          .attr("font-family", "Roboto")
          .text("When ready click the arrow below for more data")

        const albumText = infoWindow.append('text')
          .attr("x", 0)
          .attr("y", 300)
          .attr("font-family", "Roboto")
          .attr("font-size", "19px")

        const artistText = infoWindow.append('text')
          .attr("x", 0)
          .attr("y", 320)
          .attr("font-family", "Roboto")
          .attr("font-size", "16px")


        const releaseDateText = infoWindow.append('text')
          .attr("x", 0)
          .attr("y", 340)
          .attr("font-family", "Roboto")
          .attr("font-size", "16px")

        const albumType = infoWindow.append('text')
          .attr("x", 0)
          .attr("y", 360)
          .attr("font-family", "Roboto")
          .attr("font-size", "16px")

        let artwork = svg.selectAll("image")
          .data(body.albums.items);
        
        artwork.enter()
          .append("image")
          .attr('xlink:href', function(d){
            return d.images[2].url
          })
          .attr('width', 64)
          .attr('height', 64)
          .attr('x', function(d, i){
            return (i % 7) * 64
          })
          .attr('y', function(d, i){
            return Math.floor(i / 7) * 64
          })

          .on('mouseover', function (d, i) {
            
            d3.select(this).transition()
                 .duration('50')
                 .attr('opacity', '.85')
          })
          
          .on('click', function (d, i) {
          
            infoWindow.append('image')
              .attr('xlink:href', d.images[1].url)
              .attr('x', 0)
              .attr('y', 0)
              .attr('width', 250)
              .attr('height', 250)
              .attr('id', 'showImage')

            const foreignObject = infoWindow.append('foreignObject')
              .attr('x', 0)
              .attr('y', 380)
              .attr('width', 300)
              .attr('height', 80)

            if (d3.select('iframe')) d3.select('iframe').remove();

            const player = foreignObject.append("xhtml:iframe")
                .attr('src', 'https://open.spotify.com/embed/album/' + d.id)
                .attr('height', 300)
                .attr('width', 80)
                .attr('allow', 'encrypted-media')

            let artists = [];
            d.artists.forEach(artist => {
              artists.push(artist.name)
            })
            // let artistsDisplay = "Artist: " + artists.join(", ");

            let date = new Date(d.release_date)
            date = date.toString().split(" ");
            date = [date[1], date[2], date[3]].join(" ")

            let albumName = d.name
            if (albumName.length > 48){
              albumName = albumName.slice(0,48) + "..."
            }

            svgText.text("")
            svgText2.text("")

            albumText.text("")
            albumText.text(albumName)

            artistText.text("")
            artistText.text("Artist: " + artists.join(", "))
            
            releaseDateText.text("Released: " + date)

          })
          
          .on('mouseout', function (d, i) {
            d3.select(this).transition()
                 .duration('50')
                 .attr('opacity', '1');
          })

        
        


          // make API call to get tracks from albums
          // let albumUrl = 'https://cors-anywhere.herokuapp.com/https://api.spotify.com/v1/albums/' + album.id + '/tracks';
          // let albumOptions = {
          //   url: albumUrl,
          //   headers: {
          //     'Authorization': 'Bearer ' + token
          //   },
          //   json: true
          // };

          
          // request.get(albumOptions, function(error, response, body){
          //   body.items.forEach(track => {
          //     track.artists.forEach(artist => {console.log('artist:' + artist.name)});
          //     console.log('track:' + track.name)

              // make API call to get audio features of tracks
              // let trackUrl = 'https://cors-anywhere.herokuapp.com/https://api.spotify.com/v1/audio-features/' + track.id;
              
              // let trackOptions = {
              //   url: trackUrl,
              //   headers: {
              //     'Authorization': 'Bearer ' + token
              //   },
              //   json: true
              // };
              
              // request.get(trackOptions, function(error, response, body) {
              //   console.log(body);
              // })

          //   });
          // });
        
        
      });
    }
  });
});