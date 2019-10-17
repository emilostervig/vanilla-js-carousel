
	var test = new Carousel('#slider',{
		speed: 600,
		arrows: true,
		prevArrowText: 'Gå tilbage',
		nextArrowText: 'Gå fremad',
		slidesToShow: 3,
		slidesToScroll: 3,
		infinite: true,
		responsive: [
			{
				breakpoint: 769,
				settings: {
					slidesToShow: 2,
					slidesToScroll: 1,
					arrows: true,
				}
			}
		]
	});
