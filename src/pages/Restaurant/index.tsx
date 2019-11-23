import React, { useState, useEffect } from 'react'
import API from 'services/api'
import API_GEO from 'services/geo-ip'
import SOCKETIO from 'services/socketio'
import RestaurantCard from 'components/RestaurantCard'
import GoogleMapView from 'components/Maps'

var geoOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0
};

const PhotoView = ({ photo } :any) => {
  return(
    <div className="column is-one-third">
    <div className="card large round">
      <div className="card-image ">
        <figure className="image">
            <img src={photo.url} alt="Image" />
        </figure>
      </div>
      <div className="card-content">
        <div className="media">
          <div className="media-content">
            <p className="">{photo.user.caption}</p>
            <p className="title is-6 no-padding">{photo.user.name}</p>
            <p className="subtitle is-7">Uploader</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

const Restaurant: React.FC = ({match}:any) => {
  const [restaurant, setRestaurant] = useState();
  const [error, setError] = useState();
  const [myLocation, setMyLocation] = useState();

  useEffect( () => {
    SOCKETIO.on('connect', () => {
      console.log("Connected to socketio - web app.", SOCKETIO.id)
    })
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
  }, [])

  useEffect( () => {

    if(match.params.id) {
      const getRestaurant = async () => {
        if(!myLocation) {
          const geo_data = await API_GEO()
          const coordinates = {
            lat: geo_data.data.lat,
            lon: geo_data.data.lon,
          }
          const myLocation = `${coordinates.lat},${coordinates.lon}`
          setMyLocation(myLocation)
        }
        try {
          const response = await API('GET', `restaurants/${match.params.id}`)
          setRestaurant(response.data)
        } catch (api_error) {
          setError(api_error)
        }
    }
    getRestaurant()
  }
  }, [restaurant, myLocation])

  const geoSuccess = (pos:any) => {
    var crd = pos.coords;
    const coordinates = {
      lat: crd.latitude,
      lon: crd.longitude
    }

    const myLocation = `${coordinates.lat},${coordinates.lon}`
    setMyLocation(myLocation)
  }

  const geoError = (err:any) => {
    setMyLocation(false)
  }

  return(
    <div id="Restaurant">
      <div className="container">
        <div className="columns">
            {
              !restaurant ? 
              <>
                <div className="column is-one-third">
                  <div className="card large round">
                  <div className="card-content">
                    Loading...
                  </div>
                  </div>
                </div>
              </>
              : <RestaurantCard restaurant={restaurant} src="view"/>
            }
          <div className="column">
            <div className="card large round">
              <div className="card-content">
                  {
                    !restaurant ?
                    'Loading...' :
                    <>
                    <div className="columns">
                      <div className="column">
                        <div className="title is-4 has-text-primary">
                          {restaurant.establishment[0]}
                        </div>
                      </div>
                    </div>
                    <div className="columns">
                      <div className="column">
                        <div className="title is-4">
                        {`${restaurant.user_rating.rating_text}: ${restaurant.user_rating.aggregate_rating}`}
                        </div>
                        <div className="subtitle is-7">
                          Rating
                        </div>
                      </div>
                      <div className="column">
                        <div className="title is-4">
                        {restaurant.average_cost_for_two}
                        </div>
                        <div className="subtitle is-7">
                          Cost for two
                        </div>
                      </div>
                    </div>
                    <div className="columns">
                      <div className="column">
                        <div className="title is-4">
                          {restaurant.phone_numbers}
                        </div>
                        <div className="subtitle is-7">
                          Phone number
                        </div>
                      </div>
                      </div>
                      <div className="title is-4">
                        Google Map
                      </div>
                    <div className="columns">
                      <GoogleMapView
                        myLocation={myLocation}
                        restaurantLocation={`${restaurant.location.latitude},${restaurant.location.longitude}`}>
                      </GoogleMapView>
                    </div>
                    <div className="title is-4">
                      Gallery
                    </div>
                    <div className="columns is-multiline">
                      {
                        restaurant.photos.map((photo:any, key:any) => {
                          return <PhotoView key={key} photo={photo.photo} />
                        })
                      }
                    </div>
                    </>
                  }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Restaurant