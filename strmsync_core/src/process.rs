use std::collections::HashSet;

use crate::config::ProcessConfig;
use crate::item::BatchItem;
use crate::result::{DownloadResult, FailResult, PackedResult, SkipResult, StrmResult};
use crate::utils::{file_extension, has_prefix, is_valid_pickcode};

pub(crate) fn process_batch_impl(config: &ProcessConfig, items: &[BatchItem]) -> PackedResult {
    let rmt_set: HashSet<String> = config
        .rmt_mediaext
        .iter()
        .map(|e| format!(".{}", e.trim().trim_start_matches('.').to_lowercase()))
        .collect();
    let download_set: HashSet<String> = config
        .download_mediaext
        .iter()
        .map(|e| format!(".{}", e.trim().trim_start_matches('.').to_lowercase()))
        .collect();

    let mut strm_results = Vec::new();
    let mut download_results = Vec::new();
    let mut fail_results = Vec::new();
    let mut skip_results = Vec::new();

    for item in items {
        if item.name.is_empty() || item.path.is_empty() {
            continue;
        }
        if item.is_dir {
            continue;
        }
        if !has_prefix(&item.path, &config.pan_media_dir) {
            if config.detail_log {
                skip_results.push(SkipResult {
                    path_in_pan: item.path.clone(),
                    reason: "路径不在网盘媒体目录下".to_string(),
                });
            }
            continue;
        }

        let ext = file_extension(&item.name);

        if config.auto_download_mediainfo && download_set.contains(&ext) {
            if item.pickcode.is_empty() {
                fail_results.push(FailResult {
                    path_in_pan: item.path.clone(),
                    reason: "不存在 pickcode，无法下载媒体信息".to_string(),
                });
                continue;
            }
            if !is_valid_pickcode(&item.pickcode) {
                fail_results.push(FailResult {
                    path_in_pan: item.path.clone(),
                    reason: format!("错误的 pickcode 值: {}", item.pickcode),
                });
                continue;
            }
            download_results.push(DownloadResult {
                path_in_pan: item.path.clone(),
                pickcode: item.pickcode.clone(),
                sha1: item.sha1.clone(),
            });
            continue;
        }

        if !rmt_set.contains(&ext) {
            if config.detail_log {
                skip_results.push(SkipResult {
                    path_in_pan: item.path.clone(),
                    reason: format!("扩展名 {} 不在可整理媒体列表中", ext),
                });
            }
            continue;
        }

        if item.size < config.min_file_size {
            if config.detail_log {
                skip_results.push(SkipResult {
                    path_in_pan: item.path.clone(),
                    reason: format!(
                        "文件大小 {} 小于最小限制 {}",
                        item.size, config.min_file_size
                    ),
                });
            }
            continue;
        }

        if item.pickcode.is_empty() {
            fail_results.push(FailResult {
                path_in_pan: item.path.clone(),
                reason: "不存在 pickcode，无法生成 STRM".to_string(),
            });
            continue;
        }
        if !is_valid_pickcode(&item.pickcode) {
            fail_results.push(FailResult {
                path_in_pan: item.path.clone(),
                reason: format!("错误的 pickcode 值: {}", item.pickcode),
            });
            continue;
        }

        strm_results.push(StrmResult {
            path_in_pan: item.path.clone(),
            pickcode: item.pickcode.clone(),
            original_file_name: item.name.clone(),
        });
    }

    PackedResult {
        strm_results,
        download_results,
        fail_results,
        skip_results,
    }
}
