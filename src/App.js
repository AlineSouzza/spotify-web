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

  //Remove token de acesso quando é deslogado da conta.
  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }

  //Salvaneo de hash no token, caso não houver.
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

    console.log(albums)

    searchTracks()
  }

  //Busca de faixas do álbum selecionado
  //TODO: Buscar faixas?

  const searchTracks = async (id) => {
    console.log("https://api.spotify.com/v1/albums/"+ id +"/tracks");
    const { data } = await axios.get("https://api.spotify.com/v1/albums/"+ id +"/tracks", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    console.log(data.items);

    setTracks(data.items)
  }

  const renderAlbums = () => {
    return <div>
      {albums.map(albums => (
        <div key={albums.id} style={{ display: 'flex', flexDirection: 'column', marginTop: '10px', background: "pink", width: '150px' }}>
          <div style={{ background: "green" }}>
            {albums.images.length ? <img style={{ width: '100px', height: '100px' }} src={albums.images[0].url} alt="" onClick={() => searchTracks(albums.id)}  /> : <div>No Image</div>}
          </div>
          <div style={{ fontSize: '20px', marginLeft: '10px', alignSelf: 'center', background: "orange" }}>
            {albums.name}
          </div>
        </div>
      ))}
    </div>
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