
	var test = new Carousel('#slider',{
		speed: 600,
		arrows: true,
		dots: true,
		prevArrowText: 'Gå tilbage',
		nextArrowText: 'Gå fremad',
		slidesToShow: 2,
		slidesToScroll: 2,
		infinite: true,
		responsive: [
			{
				breakpoint: 769,
				settings: {
					dots: true,
					slidesToShow: 2,
					slidesToScroll: 1,
					arrows: true,
				}
			}
		]
	});
