import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import _ from 'lodash';

const getEl = el => document.querySelector(el);

const gallery = getEl('.gallery');
const form = getEl('#search-form');
const loading = getEl('.loading');

let pageCounter = 1;
let inputValue = '';

const lightBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const getImages = (value) => {
  return axios.get('https://pixabay.com/api/', {
    params: {
      key: '30777665-7c77f225ca344d7989ea6f444',
      q: value,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: pageCounter,
      per_page: 40,
    },
  });
};

form.addEventListener('submit', e => {
  e.preventDefault();
  inputValue = e.target.elements[0].value;
  gallery.innerHTML = '';
  pageCounter = 1;
  getImages(inputValue)
    .then(res => {
        if (res.data.hits.length === 0) {
          gallery.innerHTML = '';
          return Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        }
        Notiflix.Notify.success(`Hooray! We found ${res.data.totalHits} images.`);
        gallery.insertAdjacentHTML('beforeend', galleryMarkup(res.data.hits));
        lightBox.refresh();
      },
    )
    .catch(error => console.log(error));
});

const galleryMarkup = (data) => {
  return data.map(photo => `<a href='${photo.largeImageURL}' class='gallery__link'>
    <img class='gallery__image' src='${photo.webformatURL}' alt='${photo.tags}' loading='lazy' />
    <div class='info'>
      <p class='info-item likes'>${photo.likes}</p>
      <p class='info-item views'>${photo.views}</p>
      <p class='info-item comments'>${photo.comments}</p>
      <p class='info-item downloads'>${photo.downloads}</p>
    </div>
    </a>
  `).join('');
};

const loadMoreHandler = () => {
  pageCounter++;
  getImages(inputValue)
    .then(res => {
      if (gallery.getElementsByTagName('a').length === res.data.totalHits) {
        return Notiflix.Notify.failure(`We're sorry, but you've reached the end of search results.`);
      }
      loading.classList.add('show')
      gallery.insertAdjacentHTML('beforeend', galleryMarkup(res.data.hits))
      loading.classList.remove('show')
      lightBox.refresh();
    });
};

window.addEventListener('scroll', _.debounce((e)=>{
  let clientViewportHeight = document.querySelector('body').clientHeight
  let position = clientViewportHeight - window.scrollY
  if(position - window.innerHeight <= clientViewportHeight * 0.10){

    loadMoreHandler(pageCounter)
  }
}, 300))










