/**
 * The shape every language file must satisfy. Adding a language means adding a
 * file that exports one of these — TypeScript then guarantees nothing is missed.
 */
export type Dictionary = {
  meta: {
    title: string;
    description: string;
  };
  common: {
    bookNow: string;
    bookWithMe: string;
    viewServices: string;
    whatsapp: string;
    call: string;
    navigate: string;
    close: string;
    back: string;
    next: string;
    minutes: string;
    from: string;
    loading: string;
    demoContent: string;
    languageName: string;
    switchTo: string;
    previousItems: string;
    nextItems: string;
  };
  nav: {
    home: string;
    services: string;
    team: string;
    gallery: string;
    experience: string;
    reviews: string;
    visit: string;
    book: string;
    admin: string;
    openMenu: string;
    closeMenu: string;
  };
  intro: {
    skip: string;
    enter: string;
    enterHint: string;
    label: string;
  };
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    lede: string;
    scroll: string;
    videoFallback: string;
  };
  services: {
    eyebrow: string;
    title: string;
    lede: string;
    duration: string;
    book: string;
  };
  team: {
    eyebrow: string;
    title: string;
    lede: string;
    specialty: string;
    availability: string;
    previous: string;
    nextBarber: string;
  };
  gallery: {
    eyebrow: string;
    title: string;
    lede: string;
    all: string;
    cuts: string;
    beards: string;
    shop: string;
    work: string;
    openImage: string;
    previous: string;
    next: string;
    counter: string;
  };
  advantages: {
    eyebrow: string;
    title: string;
    lede: string;
  };
  experience: {
    eyebrow: string;
    title: string;
    lede: string;
    play: string;
    pause: string;
  };
  testimonials: {
    eyebrow: string;
    title: string;
    lede: string;
    disclaimer: string;
    ratingLabel: string;
  };
  location: {
    eyebrow: string;
    title: string;
    hours: string;
    closed: string;
    address: string;
    contact: string;
    mapNotice: string;
    today: string;
  };
  weekdays: {
    long: [string, string, string, string, string, string, string];
    short: [string, string, string, string, string, string, string];
  };
  months: [string, string, string, string, string, string, string, string, string, string, string, string];
  booking: {
    eyebrow: string;
    title: string;
    lede: string;
    steps: {
      service: string;
      barber: string;
      time: string;
      details: string;
      confirm: string;
    };
    stepCounter: string;
    chooseService: string;
    chooseBarber: string;
    anyBarber: string;
    anyBarberNote: string;
    chooseDate: string;
    chooseTime: string;
    noSlots: string;
    noSlotsHint: string;
    closedThatDay: string;
    loadingSlots: string;
    morning: string;
    afternoon: string;
    evening: string;
    yourDetails: string;
    fullName: string;
    fullNamePlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    phoneHint: string;
    email: string;
    emailOptional: string;
    emailPlaceholder: string;
    notes: string;
    notesOptional: string;
    notesPlaceholder: string;
    summary: string;
    summaryService: string;
    summaryBarber: string;
    summaryWhen: string;
    summaryDuration: string;
    summaryPrice: string;
    summaryName: string;
    summaryPhone: string;
    confirmButton: string;
    confirming: string;
    successTitle: string;
    successBody: string;
    confirmationNumber: string;
    addToCalendar: string;
    bookAnother: string;
    errors: {
      nameRequired: string;
      nameTooShort: string;
      phoneRequired: string;
      phoneInvalid: string;
      emailInvalid: string;
      slotTaken: string;
      generic: string;
      selectService: string;
      selectTime: string;
    };
    demoNotice: string;
  };
  admin: {
    title: string;
    subtitle: string;
    demoWarning: string;
    today: string;
    day: string;
    week: string;
    filterBarber: string;
    allBarbers: string;
    noAppointments: string;
    client: string;
    service: string;
    barber: string;
    time: string;
    status: string;
    actions: string;
    confirmed: string;
    completed: string;
    cancelled: string;
    noShow: string;
    markCompleted: string;
    markNoShow: string;
    cancel: string;
    cancelConfirm: string;
    blockTime: string;
    blockedTimes: string;
    blockDate: string;
    blockFrom: string;
    blockTo: string;
    blockReason: string;
    blockReasonPlaceholder: string;
    addBlock: string;
    removeBlock: string;
    noBlocks: string;
    total: string;
    revenue: string;
    upcoming: string;
    backToSite: string;
    storageMode: string;
    storageDemo: string;
    storageSupabase: string;
  };
  footer: {
    about: string;
    explore: string;
    hours: string;
    contact: string;
    follow: string;
    privacy: string;
    accessibility: string;
    terms: string;
    rights: string;
    builtNotice: string;
  };
};
