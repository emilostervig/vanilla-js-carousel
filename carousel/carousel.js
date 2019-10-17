	// TODO: dispatch events for various checkpoints in functions.
	// TODO: Figure our how to do infinite and cloned slides.
		// after animation timeout add new clones and go to slide wihtout animation
		// then remove and re-add clones
	// TODO: Add dots
	// TODO: Add responsive capabilities
	// TODO: Add "destroy" method

	var Carousel = function(selector, userSettings){
		var _ = this;
		_.selector = selector;
		_.userSettings = userSettings;
		_.carousels = document.querySelectorAll(selector);

		for (var i = _.carousels.length - 1; i >= 0; i--) {
			var current = _.carousels[i];
			new CarouselSlider(current, _.userSettings);
		}
	}

	var CarouselSlider = function(targetElement, userSettings){
		var _ = this;
		targetElement.carousel = this;

		// properties
		_.userSettings = userSettings;
		_.defaultSettings = {
			slidesToShow: 1,
			slidesToScroll: 1,
			infinite: false,
			arrows: false,
			dots: false,
			speed: 500,
			autoplay: false,
			prevArrowText: '',
			nextArrowText: '',
			animation: "ease-out",
			responsive: [],
		}

		_.settings = {};

		_.carousel = targetElement;
		_.slides = _.carousel.children;
		_.carouselList = false;
		_.carouselTrack = false;
		_.prevArrow = false;
		_.nextArrow = false;
		_.slideClones = [];

		_.currentSlide = 0;
		_.width = 0;
		_.slidesCount = _.slides.length;

		_.animating = false;
		_.breakpoints = [];
		_.currentBreakpoint = false;
		_.currentBreakpointWidth = false;

		/*
		*
		* Methods
		*
		*/
		 _.debounce = function(func, wait = 100) {
		  	let timeout;
		  	return function(...args) {
		    clearTimeout(timeout);
		    timeout = setTimeout(() => {
		      func.apply(this, args);
		    }, wait);
		  };
		}

		// merges 2 objects width settings
		_.mergeSettings = function(defaultSettings, userSettings){
			for(var property in userSettings){
				if(userSettings.hasOwnProperty(property)){
					defaultSettings[property] = userSettings[property]
				}
			}
			return defaultSettings;
		}

		// add .carousel-list
		_.addCarouselList = function(){
			var carouselList = document.createElement('div');
			carouselList.classList.add('carousel-list');
			carouselList.prepend(_.carouselTrack);
			_.carousel.appendChild(carouselList);
			_.carouselList = carouselList;
		}

		// add .carousel-track
		_.addCarouselTrack = function(){
			var carouselTrack = document.createElement('div'); // create track element
			carouselTrack.classList.add('carousel-track');

			for (var i = _.slides.length - 1; i >= 0; i--) {
				carouselTrack.prepend(_.slides[i]); // add slides to track
			}
			_.carousel.appendChild(carouselTrack); // append to carousel
			_.carouselTrack = carouselTrack; // assign element to property
			_.slides = _.carouselTrack.children; // reassign children
		}

		// add classes to element
		_.addClasses = function(){
			_.carousel.classList.add('carousel-initialized');
			for (var i = 0; i < _.slides.length; i++) {
				_.slides[i].classList.add('carousel-slide')
			}
		}

		// add arrows
		_.addArrows = function(){
			if(_.settings.arrows != true){
				return false;
			}
			var prevArrow = document.createElement('button');
			prevArrow.innerHTML = _.settings.prevArrowText;
			prevArrow.classList.add('carousel-arrow', 'prev-button');
			prevArrow.addEventListener('click', _.goToPrev);
			_.prevArrow = prevArrow;

			var nextArrow = document.createElement('button');
			nextArrow.innerHTML = _.settings.nextArrowText;
			nextArrow.classList.add('carousel-arrow', 'next-button');
			nextArrow.addEventListener('click', _.goToNext);
			_.nextArrow = nextArrow;

			_.carousel.prepend(prevArrow);
			_.carousel.append(nextArrow);
		}


		_.addDots = function(){

		}

		_.transformTrack = function () {
			var width = _.width / _.settings.slidesToShow;
			var offset = 0;
			if(_.settings.infinite == true){
				offset = _.calculateClonesAmount() * width * -1;
			}

			//var value = ((_.currentSlide * _.width) * -1) - offset;
			var value = offset + ( _.currentSlide  * -width);
			console.log('currentSlide', _.currentSlide);
			// Code for Chrome, Safari, Opera
		    _.carouselTrack.style.WebkitTransform = "translate3d("+ value +"px , 0px,0px)";
		    // Code for IE9
		    _.carouselTrack.style.msTransform = "translate3d("+ value +"px , 0px,0px)";
		    // Standard syntax
		    _.carouselTrack.style.transform = "translate3d("+ value +"px , 0px,0px)";

			console.log('transforming track')
		}

		// calculate sizes
		_.calculateSizes = function(){
			var width = (_.carouselList.clientWidth) / _.settings.slidesToShow;
			var slides = _.slidesCount;
			if(_.settings.infinite == true){
				var clones = _.calculateClonesAmount();
				slides = slides + (clones * 2);


			}
			for (var i = 0; i < _.slides.length; i++) {
				_.slides[i].style.width = width + 'px';
			}
			_.carouselTrack.style.width = (width * slides) + 'px';
			_.width = _.carouselList.clientWidth;
			_.transformTrack()
		}

		_.setSlide = function(slide){
			_.currentSlide = slide;
		}

		_.goToSlide = function(slide, prevSlide){
			if(_.animating == true){
				return false;
			}
			_.animating = true;
			_.currentSlide = slide;
			if('beforeChange' in _.userSettings){
				_.userSettings.beforeChange(slide, prevSlide, _.carousel);
			}

			_.carouselTrack.style.transition = 'all '+ _.settings.speed + 'ms '+ _.settings.animation;

			if(_.currentSlide !== slide){
				_.currentSlide = slide;
				_.transformTrack();
			}

			setTimeout(function(){
				_.carouselTrack.style.transition = '';
				if(slide >= _.slidesCount || slide < 0){
					var newSlide = _.currentSlide - _.slidesCount;
					if(_.currentSlide < 0){
						newSlide = _.currentSlide + _.slidesCount;
					}
					//var newSlide = (slide  % _.settings.slidesToScroll );
					_.currentSlide = newSlide;

					console.log('resetting to ', newSlide);
				}
				_.calculateSizes();

				if('afterChange' in _.userSettings){
					_.userSettings.afterChange(slide, prevSlide, _.carousel);
				}
				_.animating = false;

			}, _.settings.speed)
		}
		_.goToNext = function(){
			if(_.settings.infinite != true && _.currentSlide  == (_.slidesCount - 1) ){
				return false;
			}
			if(_.currentSlide + _.settings.slidesToScroll > (_.slidesCount - 1) + _.calculateClonesAmount()){
				return false;
			}


			var toScroll = _.settings.slidesToScroll;

			if( _.currentSlide + toScroll > (_.slidesCount + _.calculateClonesAmount() - 1) ){
				toScroll = (_.slidesCount - 1 ) -  _.currentSlide;
			}

			var prevSlide = _.currentSlide;
			var goto = (_.currentSlide + toScroll);
			//_.currentSlide = (_.currentSlide + toScroll);
			_.goToSlide(goto, prevSlide );
			_.transformTrack();
		}

		_.goToPrev = function(){
			if(_.settings.infinite != true && _.currentSlide == 0 ){
				console.log('cant go back')
				return false;
			}
			var toScroll = _.settings.slidesToScroll;
			if( _.currentSlide - toScroll < (0 - _.calculateClonesAmount()) ){
				toScroll = _.currentSlide;
			}

			if(_.currentSlide - _.settings.slidesToScroll < 0 - _.calculateClonesAmount()){
				return false;
			}




			var prevSlide = _.currentSlide;
			var goto = _.currentSlide - toScroll;
			console.log(goto);
			_.goToSlide(goto, prevSlide);
			_.transformTrack();
		}
		_.addResizeEvent = function(){
			window.addEventListener('resize', _.debounce( () => {
				_.checkResponsive();
				_.calculateSizes();
			}, 150));
		}

		_.calculateClonesAmount = function(){
			if(_.settings.infinite == false){
			 	return 0;
			}
			var current = _.currentSlide;
			var toShow = _.settings.slidesToShow;
			var toScroll = _.settings.slidesToScroll;
			var total = _.slidesCount - 1;

			var next = _.currentSlide;


			return _.settings.slidesToScroll + (_.slidesCount % _.settings.slidesToShow);
		}

		_.addClones = function(){
			if(_.settings.infinite != true){
				return false;
			}
			// TODO: Fix wrong slides being appended

			var amount = _.calculateClonesAmount();
			var prevClones = _.carouselTrack.querySelectorAll('.carousel-slide:not(.clone)');
			prevClones = [...prevClones].slice(-amount);
			for (var i = prevClones.length -1; i >= 0; i--) {
				var clone = prevClones[i].cloneNode(true);
				clone.classList.add('clone','prev-clone');
				_.carouselTrack.prepend(clone);
			}


			var nextClones = _.carouselTrack.querySelectorAll('.carousel-slide:not(.clone)');
			nextClones = [...nextClones].slice(0, amount); // should get first x real slides
			for (var i = 0; i < nextClones.length; i++) {
				var clone = nextClones[i].cloneNode(true);
				clone.classList.add('clone','next-clone');
				_.carouselTrack.append(clone);
			}

			_.slidesCount = _.slides.length - ( _.calculateClonesAmount() *2 );
			_.slideClones = _.carouselTrack.querySelectorAll('.carousel-slide.clone');
		}


		_.setupBreakpoints = function(){
			if(!_.settings.responsive.length ){
				return false;
			}
			_.settings.responsive.forEach((breakpoint) => {
				if(! 'breakpoint' in breakpoint){
					return; // skip current iteration
				}
				_.breakpoints[breakpoint['breakpoint']] = breakpoint['settings'];
			})
		}

		_.checkResponsive = function(){
			console.log('checkResponsive()')
			var winWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
			var currentBreakpoint = _.currentBreakpoint;
			var currentBreakpointWidth = _.currentBreakpointWidth;
			var newBreakpoint = false;
			var newBreakpointWidth = false;
			for (var i in _.breakpoints) {
				if( winWidth < parseInt(i)){
					newBreakpoint = _.breakpoints[i];
					newBreakpointWidth = i;
				}
			}
			console.log(currentBreakpointWidth, newBreakpointWidth)
			if(newBreakpointWidth != _.currentBreakpointWidth){
				_.currentBreakpoint = newBreakpoint;
				_.currentBreakpointWidth = newBreakpointWidth;

				_.reinitCarousel();
			}

		}

		_.removeClones = function (){
			for (var i = 0; i < _.slideClones.length; i++) {
				_.slideClones[i].parentNode.removeChild(_.slideClones[i]);
			}
		}
		_.removeArrows = function(){
			if(_.nextArrow != false){
				_.nextArrow.parentNode.removeChild(_.nextArrow);
				_.nextArrow = false;
			}
			if(_.prevArrow != false){
				_.prevArrow.parentNode.removeChild(_.prevArrow);
				_.prevArrow = false;
			}
		}
		_.removeDots = function(){
			// TODO: do this
		}
		_.reinitCarousel = function(){
			console.log('reinitCarousel()')
			var oldSettings = _.settings;

			if(_.currentBreakpoint != false){
				_.settings = _.mergeSettings(_.defaultSettings, _.currentBreakpoint)
			} else{
				_.settings = _.mergeSettings(_.defaultSettings, _.userSettings)
			}
			_.removeClones();
			_.addClones();
			_.removeArrows();
			_.addArrows();
			_.removeDots();
			_.addDots();
			_.calculateSizes();
		}
		// prepares all changes to carousel
		_.prepareCarousel = function(){
			_.settings = _.mergeSettings(_.defaultSettings, _.userSettings);
			_.addCarouselTrack();
			_.addCarouselList();
			_.setupBreakpoints();
			_.checkResponsive();
			_.addArrows();
			_.addDots();
			_.addClasses();
			_.addResizeEvent();
			//_.calculateSizes();
			if(_.settings.infinite == true){
				_.addClones();
			}
		}

		// initialize the carousel
		_.init = function(){
			_.prepareCarousel();
			_.calculateSizes();
			window.slider = _;
		}


		_.init();


	}
