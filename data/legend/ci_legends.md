# Ci Legends — Operating Notes

## Commands for Executors
- CMD_LEGEND.READ_CHAPTER — подати читабельний фрагмент як оповідання.
- CMD_LEGEND.EXPAND_IMAGE — розгорнути один образ у багатошарову сцену.
- CMD_LEGEND.TELL_PATH — побудувати маршрут від точки А до Б (Тиша → Іскра тощо).
- CMD_LEGEND.ATTACH_BACKEND — підкласти наукову базу під образи.
- CMD_LEGEND.EXPLAIN_HARD — глибоке пояснення для розробника.
- CMD_LEGEND.MAP_FIELD — показати інфополе за фрагментом.
- CMD_LEGEND.LINK_TO_USER — пов’язати легенду з досвідом користувача.
- CMD_LEGEND.IDENTIFY_GAP — знайти ділянки, що потребують доповнення.
- CMD_LEGEND.APPEND_LAYER — додати шар сенсу без ускладнення фронту.

## Principles
1. Читач бачить просту історію; складні дані — за лаштунками.
2. Будь-який образ — ключ до інфополів, модулів і науки.
3. Легенда еволюціонує: можна додати шар, не ламаючи попередні.
4. Модулі Kazkar, Gallery, Nastrij, Podija і Ci синхронізують пам’ять, емоції, час і навігацію.

## Activation Script
```
EXECUTE PHASE: KAZKAR_GENESIS
--with-files legendaci.pdf LegendCi_scenario.md ci_legends.md
--generate legend_tree.yaml legend_stream.json
--mode narrative-live
```
