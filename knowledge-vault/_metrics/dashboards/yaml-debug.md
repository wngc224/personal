# 🛠️ YAML診断スクリプト

Obsidian → DevTools (⌥⌘I) のConsoleに以下をコピペして実行：

## 1. 基本的なYAMLパース確認

```javascript
// config ファイルの診断
(async () => {
    const configPath = '_metrics/config/kpi-definitions.yaml';
    const dataPath = '_metrics/data/current-values.yaml';
    
    console.log('🔍 YAML診断開始...');
    
    try {
        // ファイル読み込み
        const configFile = app.vault.getAbstractFileByPath(configPath);
        const dataFile = app.vault.getAbstractFileByPath(dataPath);
        
        if (!configFile) {
            console.error('❌ Config file not found:', configPath);
            return;
        }
        
        if (!dataFile) {
            console.error('❌ Data file not found:', dataPath);
            return;
        }
        
        const configText = await app.vault.read(configFile);
        const dataText = await app.vault.read(dataFile);
        
        console.log('📁 Config file size:', configText.length, 'chars');
        console.log('📁 Data file size:', dataText.length, 'chars');
        
        // YAML パース テスト
        const YAML = window.YAML || window.jsyaml;
        
        if (!YAML) {
            console.error('❌ YAML parser not available');
            console.log('Available parsers:', {
                'window.YAML': !!window.YAML,
                'window.jsyaml': !!window.jsyaml,
                'app.loadYaml': typeof app.loadYaml
            });
            return;
        }
        
        console.log('✅ YAML parser found:', YAML.constructor.name);
        
        // Config パース
        try {
            const config = YAML.parse(configText);
            console.log('✅ Config parsed successfully');
            console.log('📊 Config structure:', Object.keys(config));
            console.log('📊 Categories:', Object.keys(config.categories || {}));
            console.log('📊 KPIs:', Object.keys(config.kpis || {}));
        } catch (configError) {
            console.error('❌ Config YAML parsing failed:', configError.message);
            console.error('📍 Error location:', configError.mark);
        }
        
        // Data パース
        try {
            const data = YAML.parse(dataText);
            console.log('✅ Data parsed successfully');
            console.log('📊 Data structure:', Object.keys(data));
            console.log('🟢 System status:', data.system);
        } catch (dataError) {
            console.error('❌ Data YAML parsing failed:', dataError.message);
            console.error('📍 Error location:', dataError.mark);
        }
        
    } catch (error) {
        console.error('❌ Critical error:', error.message);
    }
})();
```

## 2. ダッシュボードで使用している実際のロジック

```javascript
// ダッシュボードと同じ5段階フォールバック戦略をテスト
(async () => {
    const configPath = "_metrics/config/kpi-definitions.yaml";
    const dataPath = "_metrics/data/current-values.yaml";
    
    console.log("🔧 ダッシュボードロジックテスト開始...");
    
    try {
        const configText = await dv.io.load(configPath);
        const dataText = await dv.io.load(dataPath);
        
        console.log("configText length:", configText?.length);
        console.log("dataText length:", dataText?.length);
        
        let config, data;
        
        // Strategy 1: app.loadYaml
        try {
            console.log("🔧 Strategy 1: app.loadYaml...");
            config = await app.loadYaml(configText);
            data = await app.loadYaml(dataText);
            console.log("✅ app.loadYaml 成功");
        } catch (yamlError) {
            console.warn("❌ app.loadYaml 失敗:", yamlError.message);
            
            // Strategy 2: window.YAML
            try {
                console.log("🔧 Strategy 2: window.YAML...");
                const YAML = window.YAML ?? window.jsyaml;
                if (YAML) {
                    config = YAML.parse(configText);
                    data = YAML.parse(dataText);
                    console.log("✅ window.YAML 成功");
                } else {
                    throw new Error('window.YAML not available');
                }
            } catch (windowYamlError) {
                console.warn("❌ window.YAML 失敗:", windowYamlError.message);
                console.log("🚨 フォールバック発動");
            }
        }
        
        console.log("最終結果:");
        console.log("config:", !!config, config ? Object.keys(config) : 'undefined');
        console.log("data:", !!data, data ? Object.keys(data) : 'undefined');
        console.log("system:", data?.system);
        
    } catch (error) {
        console.error("🚨 Critical:", error.message);
    }
})();
```

## 3. 個別行チェック（YAML構文エラー特定）

```javascript
// 行ごとのYAML検証
(async () => {
    const dataPath = '_metrics/data/current-values.yaml';
    const file = app.vault.getAbstractFileByPath(dataPath);
    const text = await app.vault.read(file);
    const lines = text.split('\n');
    
    console.log('📝 行別YAML検証:');
    
    let yamlBuffer = '';
    for (let i = 0; i < lines.length; i++) {
        yamlBuffer += lines[i] + '\n';
        
        try {
            window.YAML.parse(yamlBuffer);
        } catch (error) {
            if (i < lines.length - 1) { // 最後の行でなければ続行
                continue;
            }
            console.error(`❌ Line ${i + 1}: ${error.message}`);
            console.error(`📍 Problem line: "${lines[i]}"`);
            break;
        }
    }
    
    console.log('✅ 行別検証完了');
})();
``` 