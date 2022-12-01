import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {

  const CLIENT_ID = "b7993d3c196d4af1bb2e6e5a5c44884c"
  const REDIRECT_URI = "http://localhost:3000"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize/"
  const RESPONSE_TYPE = "token"
  const [token, setToken] = useState("")
  const [searchKey, setSearchKey] = useState("")
  const [albums, setAlbums] = useState([])
  const [tracks, setTracks] = useState([])
  const [selectedAlbum, setSelectedAlbum] = useState("")
  const [infoTrack, setinfoTrack] = useState(null)
  const [selectedTrack, setSelectedTrack] = useState("")

  //Remove token de acesso quando é deslogado da conta.
  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }

  //Salvando o hash no token, caso não tenha token.
  useEffect(() => {
    const hash = window.location.hash
    let token = window.localStorage.getItem("token")

    if (!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

      window.location.hash = ""
      window.localStorage.setItem("token", token)
    }

    setToken(token)

  }, [])

  function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  }

  //Realiza pesquisa de Álbuns
  const searchAlbums = async (e) => {
    e.preventDefault()
    const { data } = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        q: searchKey,
        type: "album"
      }
    })

    console.log(data)

    setAlbums(data.albums.items)
  }

  //Busca de faixas do álbum selecionado
  const searchTracks = async (id) => {
    const { data } = await axios.get("https://api.spotify.com/v1/albums/" + id + "/tracks", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    console.log(data);

    setTracks(data.items)
    setSelectedAlbum(id)
  }

  const searchInfoTrack = async (id) => {
    const { data } = await axios.get("https://api.spotify.com/v1/tracks/" + id, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    console.log(data);

    setinfoTrack(data);
    setSelectedTrack(id);
  }

  const renderAlbums = () => {
    return <div>
      {albums.map(albums => (
        <div key={albums.id} style={{ display: 'flex', flexDirection: 'row', marginTop: '10px', width: '500px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '150px' }}>
            <div>
              {albums.images.length ? <img style={{ width: '150px', height: '150px' }} src={albums.images[0].url} alt="" onClick={() => searchTracks(albums.id)} /> : <div>No Image</div>}
            </div>
            <div style={{ fontSize: '20px', marginLeft: '10px', alignSelf: 'center'}}>
              {albums.name}
            </div>
          </div>
          <div style={{ width: '350px' }}>
            {renderTracks(albums.id)}
          </div>
        </div>
      ))}
    </div>
  }

  const renderTracks = (id) => {
    if (selectedAlbum === id) {
      return <div>
        {tracks.map(track => (
          <div key={track.id} onClick={() => searchInfoTrack(track.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: '10px', fontSize: '20px'}}>
            {track.name}
            {renderInfoTrack(track.id)}
          </div>
        ))}
      </div>
    }
  }

  const renderInfoTrack = (id) => {
    if (selectedTrack === id) {
    return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: '20px', fontSize: '15px'}}>
      <div>popularidade: {infoTrack.popularity}</div>
      <div>duração: {millisToMinutesAndSeconds(infoTrack.duration_ms)}</div>
    </div>
    }
  }

  let mensagem = token ? "Bem-vindo" : "Faça o seu login"

  return (
    <div className="App">
      <header className="App-header">
        <h1>{mensagem}</h1>
        {!token
          ?
          <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Fazer login no Spotify</a>
          :
          <div>
            <button onClick={logout}>Sair</button>
            <form onSubmit={searchAlbums}>
              <input type="text" onChange={e => setSearchKey(e.target.value)} />
              <button type={"submit"}>Search</button>
            </form>
            {renderAlbums()}
          </div>}
      </header>
    </div>
  );
}

export default App;