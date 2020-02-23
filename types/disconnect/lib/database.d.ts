export default class Database {
  getArtist(artist: number | string): Database.Artist

  getArtist(
    artist: number | string,
    callback: (err: Error, artist: Database.Artist) => void
  ): Client

  getArtistReleases(
    artist: number | string,
    params?: Database.Params.List
  ): Promise<Database.ArtistReleases>

  getArtistReleases(
    artist: number | string,
    callback: (err: Error, releases: Database.ArtistReleases) => void
  ): Client

  getArtistReleases(
    artist: number | string,
    params: Database.Params.List,
    callback: (err: Error, releases: Database.ArtistReleases) => void
  ): Client

  getRelease(release: number | string): Promise<Database.Release>

  getRelease(
    release: number | string,
    callback: (err: Error, release: Database.Release) => void
  ): Client

  getReleaseRating(
    release: number | string,
    user: string
  ): Promise<Database.ReleaseRating>

  getReleaseRating(
    release: number | string,
    user: string,
    callback: (err: Error, rating: Database.ReleaseRating) => void
  ): Client

  setReleaseRating(
    release: number | string,
    user: string,
    rating: number
  ): Promise<Database.ReleaseRating>

  setReleaseRating(
    release: number | string,
    user: string,
    rating: number,
    callback: (err: Error, rating: Database.ReleaseRating) => void
  ): Client

  setReleaseRating(
    release: number | string,
    user: string,
    rating: null
  ): Promise

  setReleaseRating(
    release: number | string,
    user: string,
    rating: null,
    callback: (err: Error, rating) => void
  ): Client

  getMaster(master: number | string): Promise<Database.Master>

  getMaster(
    master: number | string,
    callback: (err: Error, master: Database.Master) => void
  ): Client

  getMasterVersions(
    master: number | string,
    params?: Database.Params.List
  ): Promise<Database.MasterVersions>

  getMasterVersions(
    master: number | string,
    callback: (err: Error, versions: Database.MasterVersions) => void
  ): Client

  getMasterVersions(
    master: number | string,
    params: Database.Params.List,
    callback: (err: Error, versions: Database.MasterVersions) => void
  ): Client

  getLabel(label: number | string): Database.Label

  getLabel(
    label: number | string,
    callback: (err: Error, label: Database.Label) => void
  ): Client

  getLabelReleases(
    label: number | string,
    params?: Database.Params.Pagination
  ): Promise<Database.LabelReleases>

  getLabelReleases(
    label: number | string,
    callback: (err: Error, releases: Database.LabelReleases) => void
  ): Client

  getLabelReleases(
    label: number | string,
    params: Database.Params.Pagination,
    callback: (err: Error, releases: Database.LabelReleases) => void
  ): Client

  getImage(url: string): Promise

  getImage(url: string, callback: (err: Error, image) => void): Client

  search(
    query: string,
    params?: Database.Params.Search & Database.Params.Pagination
  ): Promise<Database.SearchResults>

  search(
    query: string,
    callback: (err: Error, results: Database.SearchResults) => void
  ): Client

  search(
    query: string,
    params: Database.Params.Search & Database.Params.Pagination,
    callback: (err: Error, results: Database.SearchResults) => void
  ): Client
}

export namespace Database {
  export interface Status {
    accepted: 'Accepted'
    draft: 'Draft'
    deleted: 'Deleted'
    rejected: 'Rejected'
  }

  export namespace Params {
    export interface Pagination {
      page?: number
      per_page?: number
    }

    export interface Sorting {
      sort?: string
      sort_order?: 'asc' | 'desc'
    }

    export type List = Pagination & Sorting

    export interface Search {
      type?: 'release' | 'master' | 'artist' | 'label'
      title?: string
      release_title?: string
      credit?: string
      artist?: string
      anv?: string
      label?: string
      genre?: string
      style?: string
      country?: string
      year?: string
      format?: string
      catno?: string
      barcode?: string
      track?: string
      submitter?: string
      contributor?: string
    }
  }

  export interface Urls {
    last: string
    next: string
  }

  export interface Pagination {
    per_page: number
    items: number
    page: number
    urls: Urls
    pages: number
  }

  export interface Image {
    height: number
    resource_url: string
    type: string
    uri: string
    uri150: string
    width: number
  }

  export interface Member {
    active: boolean
    id: number
    name: string
    resource_url: string
  }

  export interface Artist {
    namevariations: string[]
    profile: string
    releases_url: string
    resource_url: string
    uri: string
    urls: string[]
    data_quality: string
    id: number
    images: Image[]
    members: Member[]
  }

  export interface ArtistRelease {
    artist: string
    id: number
    main_release: number
    resource_url: string
    role: string
    thumb: string
    title: string
    type: string
    year: number
    format: string
    label: string
    status: string
  }

  export interface ArtistReleases {
    pagination: Pagination
    releases: ArtistRelease[]
  }

  export interface ReleaseArtist {
    anv: string
    id: number
    join: string
    name: string
    resource_url: string
    role: string
    tracks: string
  }

  export interface Contributor {
    resource_url: string
    username: string
  }

  export interface Rating {
    average: number
    count: number
  }

  export interface Submitter {
    resource_url: string
    username: string
  }

  export interface Community {
    contributors: Contributor[]
    data_quality: string
    have: number
    rating: Rating
    status: string
    submitter: Submitter
    want: number
  }

  export interface Company {
    catno: string
    entity_type: string
    entity_type_name: string
    id: number
    name: string
    resource_url: string
  }

  export interface Format {
    descriptions: string[]
    name: string
    qty: string
  }

  export interface Identifier {
    type: string
    value: string
  }

  export interface Series {
    name: string
    entity_type: string
    catno: string
    resource_url: string
    id: number
    entity_type_name: string
  }

  export interface ReleaseLabel {
    catno: string
    entity_type: string
    id: number
    name: string
    resource_url: string
  }

  export interface Track {
    duration: string
    position: string
    type_: string
    title: string
    extraartists: ReleaseArtist[]
  }

  export interface Video {
    description: string
    duration: number
    embed: boolean
    title: string
    uri: string
  }

  export interface Release {
    title: string
    id: number
    artists: ReleaseArtist[]
    data_quality: string
    thumb: string
    community: Community
    companies: Company[]
    country: string
    date_added: Date
    date_changed: Date
    estimated_weight: number
    extraartists: ReleaseArtist[]
    format_quantity: number
    formats: Format[]
    genres: string[]
    identifiers: Identifier[]
    images: Image[]
    labels: ReleaseLabel[]
    lowest_price: number
    master_id: number
    master_url: string
    notes: string
    num_for_sale: number
    released: string
    released_formatted: string
    resource_url: string
    series: Series[]
    status: string
    styles: string[]
    tracklist: Track[]
    uri: string
    videos: Video[]
    year: number
  }

  export interface ReleaseRating {
    username: string
    release: number
    rating: number
  }

  export interface Master {
    styles: string[]
    genres: string[]
    videos: Video[]
    title: string
    main_release: number
    main_release_url: string
    uri: string
    artists: ReleaseArtist[]
    versions_url: string
    year: number
    images: Image[]
    resource_url: string
    tracklist: Track[]
    id: number
    num_for_sale: number
    lowest_price: number
    data_quality: string
  }

  export interface Version {
    status: string
    stats: {
      user: {
        in_collection: number
        in_wantlist: number
      }
      community: {
        in_collection: number
        in_wantlist: number
      }
    }
    thumb: string
    format: string
    country: string
    title: string
    label: string
    released: string
    major_formats: string[]
    catno: string
    resource_url: string
    id: number
  }

  export interface MasterVersions {
    pagination: Pagination
    versions: Version[]
  }

  export interface Sublabel {
    resource_url: string
    id: number
    name: string
  }

  export interface Label {
    profile: string
    releases_url: string
    name: string
    contact_info: string
    uri: string
    sublabels: Sublabel[]
    urls: string[]
    images: Image[]
    resource_url: string
    id: number
    data_quality: string
  }

  export interface SearchResult {
    style: string[]
    thumb: string
    title: string
    country: string
    format: string[]
    uri: string
    community: {
      want: number
      have: number
    }
    label: string[]
    catno: string
    year: string
    genre: string[]
    resource_url: string
    type: string
    id: number
    barcode: string[]
  }

  export interface SearchResults {
    pagination: Pagination
    results: SearchResult[]
  }
}
