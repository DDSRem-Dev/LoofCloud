use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
pub struct StrmResult {
    pub path_in_pan: String,
    pub pickcode: String,
    pub original_file_name: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
pub struct DownloadResult {
    pub path_in_pan: String,
    pub pickcode: String,
    pub sha1: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
pub struct FailResult {
    pub path_in_pan: String,
    pub reason: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
pub struct SkipResult {
    pub path_in_pan: String,
    pub reason: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
pub struct PackedResult {
    pub strm_results: Vec<StrmResult>,
    pub download_results: Vec<DownloadResult>,
    pub fail_results: Vec<FailResult>,
    pub skip_results: Vec<SkipResult>,
}
