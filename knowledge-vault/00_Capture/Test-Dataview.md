# Dataview動作テスト

## 基本クエリテスト
```dataview
LIST FROM "20_Permanent"
SORT file.mtime desc
```

## フォルダ別リストテスト
```dataview
LIST FROM "_templates"
```

## タグクエリテスト（将来用）
```dataview
LIST FROM ""
WHERE contains(file.tags, "#permanent")
SORT file.mtime desc
```

## テーブル表示テスト
```dataview
TABLE file.size, file.mtime as "更新日"
FROM ""
SORT file.mtime desc
LIMIT 5
```

---
#test #dataview 