import React, { useRef, useState, useEffect} from 'react';
import axios from 'axios';
import './styles.css';
import wizardStart from './assets/wizard-start.png';
import wizardFailure from './assets/wizard-failure.png';
import wizardSuccess from './assets/wizard-success.png';

function ImageUploader() {
  const inputFileRef = useRef(null);
  const [imageUrl, setImageUrl] = useState('');
  const [animeInfo, setAnimeInfo] = useState(null); // State to store API response
  const [loading, setLoading] = useState(false);
  const [newData, setNewData] = useState(0);
  const [failure, setFailure] = useState(false);
  const [success, setSuccess] = useState(false);
  const [guesses, setGuesses] = useState(0);

  

  function filter_data(response)
  {
    const already_named = [];
    let result_data_filtered = [];
    outerLoop: for (const anime of response.data.result)
    {
      for (const named of already_named)
      {
        if (anime.anilist.title.english === named || anime.anilist.isAdult)
        {
          continue outerLoop;
        }
      }
      already_named.push(anime.anilist.title.english);
      result_data_filtered.push(anime);
    }
    console.log(result_data_filtered);
    return(result_data_filtered);
  }

  const handleImageUpload = async () => {
    const selectedFile = inputFileRef.current.files[0];

    if (selectedFile) {
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append('image', selectedFile);
        const response = await axios.post('https://api.trace.moe/search?&cutBorders&anilistInfo', formData);
        setNewData(prevKey => prevKey + 1);
        // Handle the response here (e.g., display anime information).
        setAnimeInfo(filter_data(response));
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    }
  };


  const handleImageUrlChange = (event) => {
    // Update the imageUrl state when the input field value changes
    // make sure valid url with regex
    if(event.target.value.match(new RegExp(/(?:((?:https|http):\/\/)|(?:\/)).+(?:.jpg|jpeg|png|mp4|gif)/gmi))) 
      setImageUrl(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent the form from submitting the traditional way
    // Make the API call when the user submits the form
    setLoading(true);
    if (imageUrl) {
      axios
        .get(`https://api.trace.moe/search?cutBorders&anilistInfo&url=${imageUrl}`)
        .then((response) => {
          setAnimeInfo(filter_data(response));
          setNewData(prevKey => prevKey + 1);
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
        });
    } 
  };  

  const incrementGuesses = () => {
    // Increment the 'guesses' variable by 1
    if(guesses +1 < animeInfo.length)
    {
      setGuesses(guesses + 1);
    }
    else
    {
      setAnimeInfo(null);
      setGuesses(0);
      setFailure(true);
    }
  };

  function victory()
  {
    setAnimeInfo(null);
    setGuesses(0);
    setSuccess(true);
  }



  return (
    <div className="page-container">
      {!animeInfo && !failure && !success && (
        <div>
          <h1 className="title">Anime Wizard</h1>
          <img className="wizard-image" src={wizardStart} alt="wizard start"></img>

          <p>Give me an <b>uncropped screensho</b>t from an anime and I will try to guess where it is from!</p>
          <p>Either paste an image URL or upload a screenshot</p>

          <form className="row-form"onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Paste a Image URL"
              value={imageUrl}
              onChange={handleImageUrlChange}
              className="url-input"
            />
            <button type="submit" className="submit-button">
              Submit
            </button>
          </form>
          <br />
          <input
            type="file"
            accept="image/*"
            ref={inputFileRef}
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        
          <button className="upload-button" onClick={() => inputFileRef.current.click()}>
          Select Image 📂
          </button>
      </div>
      )} 
      {failure && (
        <div>
          <h1 className="title">Not this time!</h1>
          <img className="wizard-image" src={wizardFailure} alt="wizard start"></img>
          <p>My powers must be fading. Sorry I could't find what you were looking for</p>
          <p>Would you like to try again?</p>
            <button className="try-button" onClick={() => setFailure(false)}>Try Again</button>
        </div>
      )}
      {success && (
        <div>
          <h1 className="title">I knew it!</h1>
          <img className="wizard-image" src={wizardSuccess} alt="wizard start"></img>
          <p>I'm glad I could be of assistance friend</p>
          <p>Want help with anything else?</p>
            <button className="try-button" onClick={() => setSuccess(false)}>Ask Again</button>
        </div>
      )}
      {loading && (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
      )}
      {animeInfo && !loading && (
        <div key={newData}>
          <h1 className="title">Guess {guesses+1}/{animeInfo.length}</h1>
          {animeInfo[guesses].anilist.title?.english ? (
            <h2>Is the anime {animeInfo[guesses].anilist.title.english}
              {animeInfo[guesses].episode && (
              <> From episode {animeInfo[guesses].episode}</>
            )}
            ?</h2>
          ) : (
            <h2>{animeInfo[guesses].filename}?</h2>
          )}
            <div className="button-container">
            <button className="yes-button" onClick={() => victory()}>Yes</button>
            <button className="no-button" onClick={incrementGuesses}>No</button>
          </div> 
          <video key={guesses} autoPlay muted controls loop className='video-player'>
            <source src={animeInfo[guesses].video} type="video/mp4"></source>
          </video>

            
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
