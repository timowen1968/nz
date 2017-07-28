<?php

/**
 * Created by PhpStorm.
 * User: Tim
 * Date: 3/9/16
 * Time: 9:22 PM
 */
class Track {

    function Track($row){
        $this->trackId = $row['track_id'];
        $this->filename = trim($row['filename']);
        $this->songTitle = trim($row['title']);
        $this->artist = trim($row['artist']);
        $this->genre = trim($row['genre']);
//        $this->album = $row['filename']; Not implemented yet

    }


    private $trackId;

    /**
     * @return mixed
     */
    public function getTrackId()
    {
        return $this->trackId;
    }

    /**
     * @param mixed $trackId
     * @return Track
     */
    public function setTrackId($trackId)
    {
        $this->trackId = $trackId;
    }
    private $filename;

    /**
     * @return mixed
     */
    public function getFilename()
    {
        return $this->filename;
    }

    /**
     * @param mixed $filename
     */
    public function setFilename($filename)
    {
        $this->filename = $filename;
    }

    /**
     * @return mixed
     */
    public function getSongTitle()
    {
        return $this->songTitle;
    }

    /**
     * @param mixed $songTitle
     */
    public function setSongTitle($songTitle)
    {
        $this->songTitle = $songTitle;
    }

    /**
     * @return mixed
     */
    public function getArtist()
    {
        return $this->artist;
    }

    /**
     * @param mixed $artist
     */
    public function setArtist($artist)
    {
        $this->artist = $artist;
    }

    /**
     * @return mixed
     */
    public function getGenre()
    {
        return $this->genre;
    }

    /**
     * @param mixed $genre
     */
    public function setGenre($genre)
    {
        $this->genre = $genre;
    }

    /**
     * @return mixed
     */
    public function getYear()
    {
        return $this->year;
    }

    /**
     * @param mixed $year
     */
    public function setYear($year)
    {
        $this->year = $year;
    }

    /**
     * @return mixed
     */
    public function getAlbum()
    {
        return $this->album;
    }

    /**
     * @param mixed $album
     */
    public function setAlbum($album)
    {
        $this->album = $album;
    }
    private $songTitle;
    private $artist;
    private $genre;
    private $year;
    private $album;

}
?>