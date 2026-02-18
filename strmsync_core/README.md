# strmsync_core

全量同步 STRM 的 Rust 核心：按配置对一批网盘文件做分类（生成 STRM / 下载媒体信息 / 失败 / 跳过）。供 Python 端批量调用，不做任何 I/O。

## 构建与安装

需先安装 [Rust](https://rustup.rs/) 与 [maturin](https://github.com/PyO3/maturin)。

```bash
# 安装 Rust 后
rustup default stable

# 安装 maturin
pip install maturin

# 在 strmsync_core 目录下，安装到当前环境（开发模式）
cd strmsync_core && maturin develop
```

若在 LoofCloud 的 backend 中使用，可在 backend 目录执行：

```bash
pip install -e ../strmsync_core
```

## Python 用法

```python
import json
import strmsync_core

config = {
    "pan_media_dir": "/媒体库",
    "rmt_mediaext": [".mp4", ".mkv", ".ts"],
    "download_mediaext": [".srt", ".nfo"],
    "min_file_size": 0,
    "auto_download_mediainfo": True,
    "detail_log": True,
}
batch = [
    {
        "name": "foo.mp4",
        "path": "/媒体库/Movie/foo.mp4",
        "is_dir": False,
        "size": 1024,
        "pickcode": "abc123def45678901",
        "sha1": "",
    },
]
result_json = strmsync_core.process_batch(json.dumps(config), json.dumps(batch))
data = json.loads(result_json)
# data["strm_results"], data["download_results"], data["fail_results"], data["skip_results"]
```

## 输入

**config_json**（`ProcessConfig`）

| 字段 | 类型 | 说明 |
|------|------|------|
| `pan_media_dir` | string | 网盘媒体根目录，仅处理该目录下的文件 |
| `rmt_mediaext` | string[] | 可整理媒体扩展名（如 `".mp4"`, `".mkv"`），生成 STRM |
| `download_mediaext` | string[] | 可下载媒体信息扩展名（如 `".srt"`, `".nfo"`） |
| `min_file_size` | number | 最小文件大小（字节），小于此值不生成 STRM，默认 0 |
| `auto_download_mediainfo` | bool | 是否将 `download_mediaext` 文件加入下载列表，默认 false |
| `detail_log` | bool | 是否在 `skip_results` 中返回跳过原因，默认 true |

**batch_json**（`BatchItem[]`）

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 文件名 |
| `path` | string | 网盘完整路径 |
| `is_dir` | bool | 是否目录（目录会被跳过） |
| `size` | number | 文件大小（字节） |
| `pickcode` | string | 115 文件提取码，17 位字母数字 |
| `sha1` | string | 可选，下载媒体信息时使用 |

## 输出

返回 JSON 字符串，结构为 `PackedResult`：

| 字段 | 说明 |
|------|------|
| `strm_results` | 需生成 STRM 的项：`path_in_pan`, `pickcode`, `original_file_name` |
| `download_results` | 需下载媒体信息的项：`path_in_pan`, `pickcode`, `sha1` |
| `fail_results` | 判定失败项：`path_in_pan`, `reason` |
| `skip_results` | 因规则跳过的项（仅当 `detail_log` 为 true 时填充）：`path_in_pan`, `reason` |

## 版本

```python
strmsync_core.__version__()  # "0.1.0"
```
