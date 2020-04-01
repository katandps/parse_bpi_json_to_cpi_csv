use serde::Deserialize;
use std::fs::File;
use std::io::Read;

use serde;
use serde_json;

use std::io;
use std::process;

use std::fmt;
use std::collections::HashMap;

fn main() {
    let mut json = File::open("./bpi.json").unwrap();
    let mut contents = String::new();

    json.read_to_string(&mut contents).unwrap();

    let res = serde_json::from_str::<Vec<Chart>>(&contents).unwrap();

    let mut dictionary = HashMap::new();

    //csvを読む
    let mut rdr = csv::Reader::from_reader(File::open("./official.csv").unwrap());
    for result in rdr.records() {
        let record = result.unwrap();
        let version = &record[0].to_string();
        let title = &record[1].to_string();
        let genre = &record[2].to_string();
        let artist = &record[3].to_string();
        dictionary.insert(title.clone(), Song { version: version.to_string(), genre: genre.to_string(), artist: artist.to_string() });
    }

    println!("バージョン,タイトル,ジャンル,アーティスト,プレー回数,BEGINNER 難易度,BEGINNER EXスコア,BEGINNER PGreat,BEGINNER Great,BEGINNER ミスカウント,BEGINNER クリアタイプ,BEGINNER DJ LEVEL,NORMAL 難易度,NORMAL EXスコア,NORMAL PGreat,NORMAL Great,NORMAL ミスカウント,NORMAL クリアタイプ,NORMAL DJ LEVEL,HYPER 難易度,HYPER EXスコア,HYPER PGreat,HYPER Great,HYPER ミスカウント,HYPER クリアタイプ,HYPER DJ LEVEL,ANOTHER 難易度,ANOTHER EXスコア,ANOTHER PGreat,ANOTHER Great,ANOTHER ミスカウント,ANOTHER クリアタイプ,ANOTHER DJ LEVEL,LEGGENDARIA 難易度,LEGGENDARIA EXスコア,LEGGENDARIA PGreat,LEGGENDARIA Great,LEGGENDARIA ミスカウント,LEGGENDARIA クリアタイプ,LEGGENDARIA DJ LEVEL,最終プレー日時");
    for re in res {
        let name = &re.title;
        if !dictionary.contains_key(name) { continue; }

        let version = &dictionary[name].version;
        let artist = &dictionary[name].artist;
        let genre = &dictionary[name].genre;

        if re.difficulty == "hyper" {
            let s = format!("12,0,0,0,---,{},---,12,0,0,0,---,===,---,12,0,0,0,---,===,---,2019-10-16 10:02", clear(re.clear));
            println! {"{},{},{},{},0,12,0,0,0,---,FULLCOMBO CLEAR,---,12,0,0,0,---,FULLCOMBO CLEAR,---,{}", version, name, genre, artist, s}
        }
        if re.difficulty == "another" {
            let s = format!("12,0,0,0,---,===,---,12,0,0,0,---,{},---,12,0,0,0,---,===,---,2019-10-16 10:02", clear(re.clear));
            println! {"{},{},{},{},0,12,0,0,0,---,FULLCOMBO CLEAR,---,12,0,0,0,---,FULLCOMBO CLEAR,---,{}", version, name, genre, artist, s}
        }
        if re.difficulty == "leggendaria" {
            let s = format!("12,0,0,0,---,===,---,12,0,0,0,---,===,---,12,0,0,0,---,{},---,2019-10-16 10:02", clear(re.clear));
            println! {"{},{},{},{},0,12,0,0,0,---,FULLCOMBO CLEAR,---,12,0,0,0,---,FULLCOMBO CLEAR,---,{}", version, name, genre, artist, s}
        }
    }
}

fn clear(int: i32) -> &'static str {
    match int {
        0 => "nop",
        1 => "aaa",
        2 => "EASY CLEAR",
        3 => "CLEAR",
        4 => "HARD CLEAR",
        5 => "EX HARD CLEAR",
        6 => "FULLCOMBO CLEAR",
        _ => ""
    }
}

#[derive(Deserialize, Debug)]
struct Chart {
    title: String,
    difficulty: String,
    clear: i32,
}

impl fmt::Display for Chart {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "hogehoge")
    }
}

struct Song {
    version: String,
    genre: String,
    artist: String,
}