use std::path::Path;

fn normalize_slash(p: &str) -> String {
    let s = p.trim().replace('\\', "/").trim_matches('/').to_string();
    if s.is_empty() {
        "/".to_string()
    } else {
        format!("/{s}")
    }
}

/// Path must be under prefix (pan_media_dir). Prefix is treated as directory (with trailing /).
pub(crate) fn has_prefix(path: &str, prefix: &str) -> bool {
    let path_norm = normalize_slash(path);
    let prefix_trim = prefix.trim().replace('\\', "/").trim_matches('/').to_string();
    if prefix_trim.is_empty() {
        return true;
    }
    let prefix_norm = format!("/{prefix_trim}/");
    path_norm == format!("/{prefix_trim}") || path_norm.starts_with(&prefix_norm)
}

pub(crate) fn file_extension(name: &str) -> String {
    Path::new(name)
        .extension()
        .and_then(|e| e.to_str())
        .map(|s| format!(".{}", s.to_lowercase()))
        .unwrap_or_default()
}

pub(crate) fn is_valid_pickcode(pc: &str) -> bool {
    let s = pc.trim();
    s.len() == 17 && s.chars().all(|c| c.is_ascii_alphanumeric())
}
