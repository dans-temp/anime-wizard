import React, { useRef, useState, useEffect} from 'react';
import axios from 'axios';
import './styles.css';

function ImageUploader() {
  const inputFileRef = useRef(null);
  const [imageUrl, setImageUrl] = useState('');
  const [animeInfo, setAnimeInfo] = useState(null); // State to store API response
  const [loading, setLoading] = useState(false);
  const [newData, setNewData] = useState(0);
  const [guesses, setGuesses] = useState(0);

  

  const handleImageUpload = async () => {
    const selectedFile = inputFileRef.current.files[0];
    console.log(selectedFile);

    if (selectedFile) {
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append('image', selectedFile);
        const response = await axios.post('https://api.trace.moe/search?&cutBorders&anilistInfo', formData);
        const already_named = [];
        let result_data_filtered = [];
        outerLoop: for (const anime of response.data.result)
        {
          for (const named of already_named)
          {
            if (anime.anilist.title.english === named)
            {
              continue outerLoop;
            }
          }
          already_named.push(anime.anilist.title.english);
          result_data_filtered.push(anime);
        }
  
        setNewData(prevKey => prevKey + 1);
        // Handle the response here (e.g., display anime information).
        setAnimeInfo(result_data_filtered);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    }
  };


  const handleImageUrlChange = (event) => {
    // Update the imageUrl state when the input field value changes
    // make sure valid url with regex
    // if(event.target.value.match(new RegExp(/(?:((?:https|http):\/\/)|(?:\/)).+(?:.jpg|jpeg|png|mp4|gif)/gmi))) 
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
          setAnimeInfo(response.data.result);
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
      console.log(animeInfo.anilist);
      setGuesses(guesses + 1);
    }
  };



  return (
    <div className="page-container">
      {!animeInfo && (
        <div>
          <h1 className="title">Anime Wizard</h1>
          <p>Give me a screenshot from an anime and I will try to guess where it is from!</p>
          <p>Either paste an image URL or upload a screenshot</p>

          <form className="row-form"onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter Image URL"
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
      {loading && (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
      )}
      {animeInfo && !loading && (
        <div key={newData}>
          <h1 className="title">Guess {guesses+1}/{animeInfo.length}</h1>
          <h2>Is the anime {animeInfo[guesses].anilist.title.english}?</h2>
            <div className="button-container">
            <button className="yes-button">Yes</button>
            <button className="no-button" onClick={incrementGuesses}>No</button>
          </div> 
          <video key={guesses} autoPlay muted controls loop className='video-player'>
            <source src={animeInfo[guesses].video} type="video/mp4"></source>
          </video>        
            <p></p>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
