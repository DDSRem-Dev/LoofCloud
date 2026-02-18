use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct ProcessConfig {
    pub pan_media_dir: String,
    pub rmt_mediaext: Vec<String>,
    pub download_mediaext: Vec<String>,
    #[serde(default)]
    pub min_file_size: u64,
    #[serde(default)]
    pub auto_download_mediainfo: bool,
    #[serde(default = "default_true")]
    pub detail_log: bool,
}

fn default_true() -> bool {
    true
}
