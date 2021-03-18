const config = {
  chapters: [
    {
      id: 'step1',
      distance: '63.5',
      duration: '4 days',
      location: {
        zoom: 9.7,
        pitch: 40,
        bearing: 0
      },
      paddingBottom: 100,
      onChapterEnter: [
        {
          layer: 'route-1',
          opacity: 1
        }
      ],
      onChapterExit: [
        {
          layer: 'route-1',
          opacity: 0
        }
      ]
    },
    {
      id: 'step2',
      distance: '275.5',
      duration: '4 days',
      location: {
        zoom: 9.3,
        pitch: 60,
        bearing: 340
      },
      paddingBottom: 150,
      onChapterEnter: [
        {
          layer: 'route-2',
          opacity: 1
        }
      ],
      onChapterExit: [
        {
          layer: 'route-2',
          opacity: 0
        }
      ]
    },
    {
      id: 'step3',
      distance: '462',
      duration: '7 days',
      location: {
        zoom: 8.3,
        pitch: 40,
        bearing: 314
      },
      paddingBottom: 330,
      onChapterEnter: [
        {
          layer: 'route-3',
          opacity: 1
        }
      ],
      onChapterExit: [
        {
          layer: 'route-3',
          opacity: 0
        }
      ]
    },
    {
      id: 'step4',
      distance: '462',
      duration: '3 years',
      location: {
        center: [ 44.9852, 12.8951],
        zoom: 16,
        pitch: 0,
        bearing: 330
      },
      paddingBottom: 350
    }
  ]
};
