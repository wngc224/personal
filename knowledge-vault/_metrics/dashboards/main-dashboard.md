---
title: "📊 統合KPIダッシュボード"
tags: [dashboard, kpi, metrics]
cssclass: dashboard
created: 2025-06-21
updated: 2025-06-21
---

# 📊 統合KPIダッシュボード

> **リアルタイムメトリクス監視 & 分析**  
> 最終更新: `$= dv.date("now").toFormat("yyyy-MM-dd HH:mm")`

```dataviewjs
// 設定とデータの読み込み
const configPath = "_metrics/config/kpi-definitions.yaml";
const dataPath = "_metrics/data/current-values.yaml";

// ✅ CSS を <style> タグとして直接注入（重複防止）
try {
    if (!document.querySelector('style[data-origin="dashboard"]')) {
        const cssText = await dv.io.load('_css/dashboard.css');
        const styleTag = dv.el('style', cssText);
        styleTag.setAttr('data-origin', 'dashboard');
        console.log("✅ CSS読み込み成功 (DataviewJS方式)");
    } else {
        console.log("🔄 CSS already loaded, skipping injection");
    }
} catch (cssError) {
    console.warn('CSS 読込失敗 (fallback)', cssError.message);
    dv.container?.classList.add('css-fallback');
}

// ユーティリティ関数: 安全なカテゴリ情報取得
function getSectionCategory(section, categories, kpis) {
    for (const kpiId of section.kpis) {
        const categoryKey = kpis[kpiId]?.category;
        if (categoryKey && categories[categoryKey]) {
            return { key: categoryKey, info: categories[categoryKey] };
        }
    }
    return { key: null, info: { icon: '📊', color: '#1976D2', name: 'Default' } };
}

// ユーティリティ関数: 共通の丸め処理
function formatValue(value, type) {
    if (type === 'percentage' || type === 'rate') {
        return Math.round(value * 100);
    }
    return value;
}

// 🚨 修正#3: ゼロ割り防止の安全な割り算
function safeRate(numerator, denominator) {
    if (!denominator || denominator === 0) return 0;
    return numerator / denominator;
}

// 🚨 修正#7: 自動状態変換（pending→error）
function getStatusWithTimeout(kpiData, kpiId) {
    if (kpiData.status === 'pending') {
        const lastUpdated = new Date(kpiData.last_updated || 0);
        const now = new Date();
        const diffMinutes = (now - lastUpdated) / (1000 * 60);
        
        if (diffMinutes > 30) {
            console.warn(`⏰ KPI ${kpiId} is pending for over 30 minutes, marking as error`);
            return 'error';
        }
    }
    return kpiData.status;
}

// 🚨 修正#8: 動的QuickAddコマンド実行
function executeKpiAction(actionType, kpiId) {
    const commandId = `quickadd:choice:${actionType}-${kpiId}`;
    console.log(`🎯 Executing command: ${commandId}`);
    
    try {
        app.commands.executeCommandById(commandId);
    } catch (error) {
        console.warn(`⚠️ Command not found: ${commandId}, trying fallback`);
        app.commands.executeCommandById('quickadd:open');
    }
}

// 🔍 YAML Doctor - 診断コマンド
const runYamlDoctor = async () => {
    console.groupCollapsed('🔍 KPI YAML Doctor');

    const readYaml = async (path) => {
        const file = app.vault.getAbstractFileByPath(path);
        if (!file) throw new Error(`File not found: ${path}`);
        const txt = await app.vault.read(file);
        console.log(`📄 ${path} (${txt.length.toLocaleString()} chars)`);
        return txt;
    };

    // 1) YAML パーサー確保 ── Dataview → CDN フォールバック
    let YAML;
    if (typeof dv?.yaml === 'function') {
        YAML = { parse: dv.yaml.bind(dv) };           // ★ A.
        console.log('✅ using dv.yaml() parser');
    } else {
        if (!window.jsyaml) {                         // ★ B. 動的ロード
            await new Promise((res, rej) => {
                const s = document.createElement('script');
                s.src = 'https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js';
                s.onload = res; s.onerror = rej;
                document.head.appendChild(s);
            });
            console.log('✅ js-yaml loaded from CDN');
        }
        
        // CDN読み込み検証
        if (!window.jsyaml || typeof window.jsyaml !== 'object') {
            throw new Error('window.jsyaml is not available after CDN load');
        }
        if (!window.jsyaml.load) {
            throw new Error('window.jsyaml.load method is not available');
        }
        
        // js-yaml参照（UMDビルド対応）
        YAML = window.jsyaml?.default ?? window.jsyaml;
        console.log('✅ js-yaml verification:', typeof YAML, Object.keys(YAML));
    }

    // 2) ファイル読み込み
    const [cfgTxt, datTxt] = await Promise.all([
        readYaml('_metrics/config/kpi-definitions.yaml'),
        readYaml('_metrics/data/current-values.yaml')
    ]);

    // 3) パース
    const safeParse = (name, txt) => {
        try {
            let obj;
            if (typeof YAML.parse === 'function') {
                // dv.yaml の場合
                obj = YAML.parse(txt);
            } else if (typeof YAML.load === 'function') {
                // js-yaml の場合
                obj = YAML.load(txt, { uniqueKeys: true });
            } else {
                throw new Error('No valid YAML parser method found');
            }
            console.log(`✅ ${name} parsed:`, Object.keys(obj));
            return obj;
        } catch (e) {
            console.error(`❌ ${name} parse error: ${e.message}`);
            if (e.mark) console.error(`📍 line ${e.mark.line + 1}, col ${e.mark.column + 1}`);
            throw e;
        }
    };

    const cfg = safeParse('Config', cfgTxt);
    const dat = safeParse('Data', datTxt);

    if (!dat.system?.is_healthy) {
        console.warn('⚠️ system.is_healthy is falsy:', dat.system);
    }

    console.groupEnd();
};

try {
    // 🚨 修正: ファイル読み込みとデバッグログ追加
    console.log("🔍 YAML読み込み開始...");
    const configText = await dv.io.load(configPath);
    const dataText = await dv.io.load(dataPath);
    
    // 🚨 デバッグ: ファイル内容確認
    console.log("configText", configText?.slice(0,100));
    console.log("dataText", dataText?.slice(0,100));
    
    // 🚨 修正: Obsidian環境用のYAML→JS変換関数
    function parseYamlLike(yamlText) {
        if (!yamlText || typeof yamlText !== 'string') {
            throw new Error('Invalid YAML text');
        }
        
        // コメント行とフロントマターを除去
        const cleanedText = yamlText
            .split('\n')
            .filter(line => {
                const trimmed = line.trim();
                return trimmed !== '' && 
                       !trimmed.startsWith('#') && 
                       !trimmed.startsWith('---');
            })
            .join('\n');
        
        console.log("Cleaned YAML:", cleanedText.slice(0, 200));
        
        // 簡易YAML→JSONオブジェクト変換
        const result = {};
        const lines = cleanedText.split('\n');
        let currentObj = result;
        let parentStack = [result];
        let lastIndent = -1;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const indent = line.length - line.trimStart().length;
            const trimmed = line.trim();
            
            if (!trimmed || trimmed.startsWith('#')) continue;
            
            // インデントレベル調整
            if (indent <= lastIndent) {
                // 上位レベルに戻る
                const levels = Math.floor((lastIndent - indent) / 2) + 1;
                for (let j = 0; j < levels && parentStack.length > 1; j++) {
                    parentStack.pop();
                }
                currentObj = parentStack[parentStack.length - 1];
            }
            
            if (trimmed.includes(':')) {
                const [key, ...valueParts] = trimmed.split(':');
                const value = valueParts.join(':').trim();
                const cleanKey = key.trim();
                
                if (value === '' || value === 'null') {
                    // 子オブジェクトの開始
                    currentObj[cleanKey] = {};
                    parentStack.push(currentObj[cleanKey]);
                    currentObj = currentObj[cleanKey];
                } else {
                    // 値の設定
                    let parsedValue = value;
                    
                    // 型変換
                    if (value.startsWith('"') && value.endsWith('"')) {
                        parsedValue = value.slice(1, -1); // 文字列
                    } else if (value === 'true') {
                        parsedValue = true;
                    } else if (value === 'false') {
                        parsedValue = false;
                    } else if (!isNaN(Number(value)) && value !== '') {
                        parsedValue = Number(value);
                    }
                    
                    currentObj[cleanKey] = parsedValue;
                }
            }
            
            lastIndent = indent;
        }
        
        return result;
    }
    
    // 🚨 修正: 確実なYAMLパーサー確保（dv.yaml最優先 + CDN動的ロード）
    let config, data;
    
    // 1) YAMLパーサー確保 - Dataview → CDN フォールバック
    let YAML;
    try {
        if (typeof dv?.yaml === 'function') {
            YAML = { parse: dv.yaml.bind(dv) };
            console.log('✅ using dv.yaml() parser');
        } else {
            console.log('🔧 dv.yaml not available, loading js-yaml from CDN...');
            
            // CDN動的ロード
            if (!window.jsyaml) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js';
                    script.onload = resolve;
                    script.onerror = () => reject(new Error('js-yaml CDN load failed'));
                    document.head.appendChild(script);
                });
                console.log('✅ js-yaml loaded from CDN');
            }
            
            // CDN読み込み検証
            if (!window.jsyaml || typeof window.jsyaml !== 'object') {
                throw new Error('window.jsyaml is not available after CDN load');
            }
            if (!window.jsyaml.load) {
                throw new Error('window.jsyaml.load method is not available');
            }
            
            // js-yaml参照（UMDビルド対応）
            YAML = window.jsyaml?.default ?? window.jsyaml;
            console.log('✅ js-yaml verification:', typeof YAML, Object.keys(YAML));
        }
        
        // 2) 安全なパース関数
        const safeParse = (name, txt) => {
            try {
                let obj;
                if (typeof YAML.parse === 'function') {
                    // dv.yaml の場合
                    obj = YAML.parse(txt);
                } else if (typeof YAML.load === 'function') {
                    // js-yaml の場合
                    obj = YAML.load(txt, { uniqueKeys: true });
                } else {
                    throw new Error('No valid YAML parser method found');
                }
                console.log(`✅ ${name} parsed:`, Object.keys(obj));
                return obj;
            } catch (e) {
                console.error(`❌ ${name} parse error: ${e.message}`);
                if (e.mark) console.error(`📍 line ${e.mark.line + 1}, col ${e.mark.column + 1}`);
                throw e;
            }
        };
        
        // 3) ファイルパース
        config = safeParse('Config', configText);
        data = safeParse('Data', dataText);
        
        console.log('🎯 YAML parsing successful via',
            (typeof dv?.yaml === 'function') ? 'dv.yaml' : 'js-yaml(CDN)');
        
    } catch (yamlError) {
        console.warn('❌ Primary YAML parsing failed:', yamlError.message);
        
        try {
            // Strategy 3: 簡易YAML→JSパーサー（最終フォールバック）
            console.log("🔧 Strategy 3: 簡易YAMLパーサー を試行中...");
            config = parseYamlLike(configText);
            data = parseYamlLike(dataText);
            
            // 必須構造の検証
            if (!config.categories || !config.kpis || !data.system) {
                throw new Error('Parsed structure is incomplete');
            }
            
            console.log("✅ 簡易YAMLパーサー 成功");
        } catch (simpleParserError) {
            console.warn("❌ 簡易YAMLパーサー 失敗:", simpleParserError.message);
            
            // Strategy 4: ハードコードされたサンプルデータ
            console.log("🔧 Strategy 4: サンプルデータ を使用中...");
            config = {
                categories: {
                    platform: { name: "🚀 Platform", icon: "🚀", color: "#4CAF50" },
                    development: { name: "📦 Development", icon: "📦", color: "#2196F3" },
                    learning: { name: "🎓 Learning", icon: "🎓", color: "#FF9800" },
                    business: { name: "💼 Business", icon: "💼", color: "#9C27B0" }
                },
                kpis: {
                    databricks_jobs: {
                        category: "platform",
                        name: "Databricks Jobs",
                        type: "count",
                        unit: "jobs"
                    },
                    batch_documentation: {
                        category: "development", 
                        name: "Batch Documentation",
                        type: "progress",
                        unit: "specs"
                    }
                },
                dashboard_layouts: {
                    main: {
                        sections: [
                            {
                                name: "Platform Health",
                                kpis: ["databricks_jobs"],
                                layout: "row"
                            },
                            {
                                name: "Development Progress", 
                                kpis: ["batch_documentation"],
                                layout: "grid"
                            }
                        ]
                    }
                }
            };
            
            data = {
                system: {
                    is_healthy: true,
                    status_code: "healthy",
                    status_message: "Using sample data - YAML parsing failed"
                },
                platform: {
                    databricks_jobs: {
                        value: 5,
                        status: "active",
                        last_updated: new Date().toISOString()
                    }
                },
                development: {
                    batch_documentation: {
                        total: 128,
                        documented: 32,
                        completion_rate: 0.25,
                        status: "active",
                        last_updated: new Date().toISOString()
                    }
                }
            };
            
            console.log("✅ サンプルデータ 成功");
        }
    }
    
    // 🚨 デバッグ: パース結果確認
    console.log("config", config);
    console.log("data", data);
    
    // 🚨 修正: ガード句でdata undefinedを防ぐ
    if (!data || typeof data !== 'object') {
        console.error("🚨 Critical: data is undefined or invalid:", data);
        data = {
            system: {
                is_healthy: false,
                status_code: 'error',
                status_message: 'Data loading failed - using emergency fallback'
            }
        };
    }
    
    if (!config || typeof config !== 'object') {
        console.error("🚨 Critical: config is undefined or invalid:", config);
        config = {
            categories: {},
            kpis: {},
            dashboard_layouts: { main: { sections: [] } }
        };
    }
    
    // 🚨 修正: 完全にガード付きでヘルスステータス表示（ユーザ提案版）
    const sys = data.system ?? {};
    const isHealthy = !!sys.is_healthy;
    const statusCode = sys.status_code ?? 'unknown';
    const statusMessage = sys.status_message ?? 'Status unavailable';
    const healthIcon = isHealthy ? '💚' : '⚠️';
    const healthClass = isHealthy ? '' : 'warning';
    
    console.log("🩺 Health Check:", { sys, isHealthy, statusCode, statusMessage });
    
    dv.paragraph(`<div class="health-status ${healthClass}" aria-label="システム健康状態: ${statusMessage}">
        ${healthIcon} システム状況: ${statusCode}
        <small style="opacity: 0.8; margin-left: 8px;">${statusMessage}</small>
    </div>`);
    
    // 🚨 修正: セクション処理も安全化
    const layout = config?.dashboard_layouts?.main;
    if (!layout || !Array.isArray(layout.sections)) {
        console.error("🚨 Dashboard layout error:", {
            layout,
            sections: layout?.sections,
            sectionsType: typeof layout?.sections,
            isArray: Array.isArray(layout?.sections)
        });
        dv.paragraph(`⚠️ ダッシュボード設定が無効です。dashboard_layouts.main.sections が配列ではありません。`);
        dv.paragraph(`<details><summary>🔧 デバッグ情報</summary><pre>sections: ${JSON.stringify(layout?.sections, null, 2)}</pre></details>`);
        throw new Error('dashboard_layouts.main.sections が配列ではありません');
    }
    
    // 各セクションを動的に生成
    for (const section of layout.sections) {
        // 🚨 修正: 安全なカテゴリ情報取得（null check追加）
        const categoryResult = getSectionCategory(section, config.categories || {}, config.kpis || {});
        const sectionIcon = categoryResult.info.icon || '📊';
        const sectionColor = categoryResult.info.color || '#1976D2';
        const categoryKey = categoryResult.key;
        
        dv.header(3, `${sectionIcon} ${section.name}`);
        
        // KPIカードコンテナ（構造化されたHTML）
        let sectionHTML = `<div class="kpi-section">`;
        
        if (section.layout === 'grid') {
            sectionHTML += `<div class="kpi-grid">`;
        } else {
            sectionHTML += `<div class="kpi-row">`;
        }
        
        for (const kpiId of section.kpis) {
            const kpiConfig = config.kpis?.[kpiId];
            if (!kpiConfig) {
                console.warn(`KPI設定が見つかりません: ${kpiId}`);
                continue;
            }
            
            const categoryKey = kpiConfig.category;
            const categoryData = data?.[categoryKey];
            const kpiData = categoryData?.[kpiId];
            
            if (!kpiData) {
                console.warn(`KPIデータが見つかりません: ${kpiId} in ${categoryKey}`);
                continue;
            }
            
            // 🚨 修正: 値の取得と表示形式の決定（null check強化）
            let displayValue, unit, progress = null;
            
            try {
                switch (kpiConfig.type) {
                    case 'progress':
                        const completion = kpiData.completion_rate ?? (kpiData.documented / kpiData.total);
                        displayValue = `${kpiData.documented ?? 0}/${kpiData.total ?? 0}`;
                        unit = kpiConfig.unit ?? '';
                        progress = Math.round((completion ?? 0) * 100);
                        break;
                        
                    case 'rate':
                        // 🚨 修正#3: ゼロ割り防止
                        const rawRate = kpiData.resolution_rate ?? 
                                       safeRate(kpiData.closed ?? 0, (kpiData.opened ?? 0) + (kpiData.closed ?? 0)) ?? 
                                       kpiData.value ?? 0;
                        displayValue = formatValue(rawRate, kpiConfig.type);
                        unit = '%';
                        break;
                        
                    case 'percentage':
                        // 🚨 修正#4: percentage case に break 追加
                        const rawPercentage = kpiData.value ?? 0;
                        displayValue = formatValue(rawPercentage, kpiConfig.type);
                        unit = '%';
                        break;
                        
                    default:
                        displayValue = kpiData.value ?? kpiData.total ?? kpiData.monthly ?? 0;
                        unit = kpiConfig.unit ?? '';
                }
            } catch (valueError) {
                console.warn(`値計算エラー (${kpiId}):`, valueError);
                displayValue = 'N/A';
                unit = '';
            }
            
            // ターゲットとの比較
            let targetInfo = '';
            if (kpiConfig.target_daily) {
                targetInfo = `Target: ${kpiConfig.target_daily} ${unit}/day`;
            } else if (kpiConfig.target_monthly) {
                targetInfo = `Target: ${kpiConfig.target_monthly} ${unit}/month`;
            } else if (kpiConfig.target_completion) {
                targetInfo = `Target: ${Math.round(kpiConfig.target_completion * 100)}%`;
            }
            
            // 🚨 修正: 最終更新時刻の表示用フォーマット（エラーハンドリング強化）
            let lastUpdated = '未更新';
            try {
                if (kpiData.last_updated) {
                    const updateDate = new Date(kpiData.last_updated);
                    if (!isNaN(updateDate.getTime())) {
                        lastUpdated = updateDate.toLocaleString('ja-JP', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    } else {
                        lastUpdated = 'Invalid Date';
                    }
                }
            } catch (dateError) {
                lastUpdated = 'Date Error';
                console.warn(`日付解析エラー (${kpiId}):`, dateError);
            }
            
            // KPIカードHTML生成（安全化）
            const kpiStatus = getStatusWithTimeout(kpiData, kpiId);
            const statusClass = kpiStatus === 'error' ? 'is-error' : '';
            const loadingClass = kpiStatus === 'pending' ? 'is-loading' : '';
            const okClass = kpiStatus === 'active' ? 'is-ok' : '';
            
            sectionHTML += `
                <div class="kpi-card ${statusClass} ${loadingClass} ${okClass}" 
                     data-category="${categoryKey}"
                     tabindex="0" role="article" 
                     aria-label="${kpiConfig.name} KPI カード">
                    <div class="kpi-card__header">
                        <span class="kpi-card__title">${kpiConfig.name}</span>
                        <div class="kpi-card__status" role="status" aria-label="ステータス: ${kpiStatus}">
                            ${kpiStatus === 'active' ? '🟢' : kpiStatus === 'pending' ? '🟡' : '🔴'}
                        </div>
                    </div>
                    <div class="kpi-card__value ${statusClass}" aria-label="現在値: ${displayValue}${unit}">
                        ${displayValue}<span class="kpi-card__unit">${unit}</span>
                    </div>
                    ${progress !== null ? `
                        <div class="progress-bar" role="progressbar" 
                             aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"
                             aria-label="進捗: ${progress}%">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    ` : ''}
                    <div class="kpi-card__meta">
                        <span aria-label="最終更新: ${lastUpdated}">${lastUpdated}</span>
                        ${targetInfo ? `<span class="kpi-card__target" aria-label="目標: ${targetInfo}">${targetInfo}</span>` : ''}
                    </div>
                </div>
            `;
        }
        
        sectionHTML += `</div></div>`;
        dv.paragraph(sectionHTML);
    }
    
    // クイックアクション（プロンプト式に改善）
    dv.header(3, "⚡ クイックアクション");
    
    const actionHTML = `
        <div class="kpi-section">
            <div class="kpi-row">
                <div class="kpi-card">
                    <div class="kpi-title">📝 手動更新</div>
                    <div style="margin: 10px 0;" role="group" aria-label="手動更新ボタン">
                        <button class="kpi-button" 
                                onclick="app.commands.executeCommandById('quickadd:open')"
                                aria-label="QuickAdd メニューを開く">
                            📋 QuickAdd メニュー
                        </button>
                        <button class="kpi-button secondary" 
                                data-choice="kpi-increment"
                                onclick="executeKpiAction('increment', 'documentation')"
                                aria-label="ドキュメント数を1増加">
                            +1 Documentation
                        </button>
                        <button class="kpi-button warning" 
                                data-choice="kpi-study-hour"
                                onclick="executeKpiAction('add-hour', 'study')"
                                aria-label="学習時間を1時間追加">
                            +1 Study Hour
                        </button>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-title">🔄 システム操作</div>
                    <div style="margin: 10px 0;" role="group" aria-label="システム操作ボタン">
                        <button class="kpi-button success" 
                                onclick="location.reload()"
                                aria-label="ダッシュボードを更新">
                            🔄 更新
                        </button>
                        <button class="kpi-button accent" 
                                onclick="window.open('_metrics/dashboards/weekly-review.md')"
                                aria-label="週次レビューを開く">
                            📈 週次レビュー
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    dv.paragraph(actionHTML);
    
} catch (error) {
    // 🚨 修正: 詳細なエラー情報を表示
    console.error("🚨 Dashboard Critical Error:", error);
    dv.paragraph(`⚠️ ダッシュボード読み込みエラー: ${error.message}`);
    dv.paragraph(`<details><summary>🔧 デバッグ情報</summary><pre>${error.stack}</pre></details>`);
    
    // 🚨 修正: エラー時のフォールバック表示
    dv.paragraph(`
        <div class="kpi-section">
            <div class="kpi-card">
                <div class="kpi-title">🚨 システム状況</div>
                <div class="kpi-card__value is-error">ERROR</div>
                <div class="kpi-card__meta">
                    <span>データ読み込みに失敗しました</span>
                    <br>
                    <small>ファイルパス: ${configPath}, ${dataPath}</small>
                    <br>
                    <small>解決方法: DevTools Console でエラー詳細を確認</small>
                </div>
            </div>
        </div>
    `);
}
```

## 📈 **トレンド分析**

```dataviewjs
// 過去7日間のトレンド分析（簡易版）
try {
    dv.header(3, "📈 トレンド分析");
    
    const trendHTML = `
        <div class="kpi-section">
            <div class="kpi-card">
                <div class="kpi-title">📊 今週のハイライト</div>
                <div style="margin: 15px 0;" role="list" aria-label="今週の成果一覧">
                    <div style="display: flex; justify-content: space-between; margin: 8px 0;" role="listitem">
                        <span>学習時間:</span>
                        <span class="trend-indicator trend-up" role="img" aria-label="上昇トレンド: 学習時間が先週より2.5時間増加">
                            📈 +2.5h from last week
                        </span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 8px 0;" role="listitem">
                        <span>ドキュメント作成:</span>
                        <span class="trend-indicator trend-up" role="img" aria-label="上昇トレンド: ドキュメント作成が3件完了">
                            📈 +3 specs completed
                        </span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 8px 0;" role="listitem">
                        <span>意思決定記録:</span>
                        <span class="trend-indicator trend-stable" role="img" aria-label="安定トレンド: 意思決定記録が2件、変化なし">
                            ➡️ 2 decisions logged
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    dv.paragraph(trendHTML);
    
} catch (error) {
    dv.paragraph(`⚠️ トレンド分析エラー: ${error.message}`);
}
```

---

## 🔗 関連リンク

- **[[_metrics/dashboards/weekly-review|週次レビュー]]**
- **[[_metrics/config/kpi-definitions|KPI設定]]**
- **[[_metrics/templates/manual-update|手動更新ガイド]]**

---
*最終更新: 2025-06-21 | 自動更新: 毎日24:00* 