import React, { useRef, useEffect, useState } from 'react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import 'tailwindcss/tailwind.css';
import { AnimatePresence, motion } from 'framer-motion';

const EditableGrid = () => {
  const lang = localStorage.getItem('lang') || '0';
  const hotRef = useRef(null);
  const hotInstance = useRef(null);
  const [selected, setSelected] = useState({ row: null, col: null });
  const [tableData, setTableData] = useState([]);
  const [jsonText, setJsonText] = useState('');
  const [isJsonFullScreen, setIsJsonFullScreen] = useState(false);
  const [isTableFullScreen, setIsTableFullScreen] = useState(false);
  const FullScreen = 'fixed top-8 left-8 right-8 bottom-8 z-50';
  const ButtonStyle = 'rounded-full px-8 py-2 mr-2 text-white ';

  const initialSpreadsheetData = Handsontable.helper.createSpreadsheetData(
    4,
    4,
  );

  useEffect(() => {
    const savedData = localStorage.getItem('handsontableData');
    let initialData;
    if (savedData) {
      initialData = JSON.parse(savedData);
      const header = Object.keys(initialData[0]);
      const dataArray = [header, ...initialData.map(Object.values)];
      setJsonText(JSON.stringify(initialData, null, 2));
      if (!isJsonFullScreen && !isTableFullScreen && !hotInstance.current) {
        hotInstance.current = new Handsontable(hotRef.current, {
          data: dataArray,
          licenseKey: 'non-commercial-and-evaluation',
          height: 'auto',
          width: 'auto',
          rowHeaders: true,
          colHeaders: true,
          fixedRowsStart: 1,
          contextMenu: true,
          manualColumnResize: true,
          manualRowResize: true,
          dropdownMenu: true,
          afterChange: function (changes, source) {
            if (source !== 'loadData') {
              updateTableData();
            }
          },
          afterSelectionEnd: (r1, c1, r2, c2) => {
            setSelected({ row: r1, col: c1 });
          },
        });
        updateTableData();
      }
    } else {
      initialData = initialSpreadsheetData;
      setJsonText(
        JSON.stringify(
          initialData.slice(1).map((row) => {
            let obj = {};
            row.forEach((cell, i) => {
              obj[initialData[0][i]] = cell;
            });
            return obj;
          }),
          null,
          2,
        ),
      );
      if (!isJsonFullScreen && !isTableFullScreen && !hotInstance.current) {
        hotInstance.current = new Handsontable(hotRef.current, {
          data: initialData,
          licenseKey: 'non-commercial-and-evaluation',
          colHeaders: true,
          contextMenu: true,
          manualColumnResize: true,
          manualRowResize: true,
          dropdownMenu: true,
          width: 'auto',
          height: 'auto',
          autoWrapRow: true,
          autoWrapCol: true,
          afterChange: function (changes, source) {
            if (source !== 'loadData') {
              updateTableData();
            }
          },
          afterSelectionEnd: (r1, c1, r2, c2) => {
            setSelected({ row: r1, col: c1 });
          },
        });
        updateTableData();
      }
    }

    return () => {
      if (hotInstance.current && (isJsonFullScreen || isTableFullScreen)) {
        hotInstance.current.destroy();
        hotInstance.current = null;
      }
    };
  }, [isJsonFullScreen, isTableFullScreen]);

  const updateTableData = () => {
    const data = hotInstance.current.getData();
    if (data.length <= 1 || data[0].length === 0) {
      alert('You must retain at least 2 rows or 1 column in the table');

      return;
    }
    const keys = data[0];
    const jsonData = data.slice(1).map((row) => {
      let obj = {};
      row.forEach((cell, i) => {
        obj[keys[i]] = cell;
      });
      return obj;
    });
    setTableData(jsonData);
    setJsonText(JSON.stringify(jsonData, null, 2));
    localStorage.setItem('handsontableData', JSON.stringify(jsonData));
  };

  const addRow = () => {
    hotInstance.current.alter('insert_row', hotInstance.current.countRows());
    updateTableData();
  };

  const removeRow = () => {
    if (selected.row !== null && hotInstance.current.countRows() > 2) {
      hotInstance.current.alter('remove_row', selected.row);
      updateTableData();
    } else if (selected.row === null) {
      alert(
        lang == '0'
          ? 'Cannot operate: \n\nYou should select at least one row'
          : '无法操作: \n\n因为您需要至少选择一行。',
      );
    } else {
      alert(
        lang == '0'
          ? 'Cannot remove row: \n\nAt least 2 rows must remain to maintain the data structure.'
          : '无法移除此行: \n\n因为表格至少需要保留两行来维持数据结构。',
      );
    }
  };

  const resetData = () => {
    const initialData = initialSpreadsheetData;
    hotInstance.current.loadData(initialData);
    setJsonText(
      JSON.stringify(
        initialData.slice(1).map((row) => {
          let obj = {};
          row.forEach((cell, i) => {
            obj[initialData[0][i]] = cell;
          });
          return obj;
        }),
        null,
        2,
      ),
    );
    localStorage.removeItem('handsontableData');
  };

  const removeColumn = () => {
    if (selected.col !== null && hotInstance.current.countCols() > 1) {
      hotInstance.current.alter('remove_col', selected.col);
      updateTableData();
    } else if (selected.col === null) {
      alert(
        lang == '0'
          ? 'Cannot operate: \n\nYou should select at least one column'
          : '无法操作: \n\n因为您需要至少选择一列。',
      );
    } else {
      alert(
        lang == '0'
          ? 'Cannot remove column: \n\nAt least 1 column must remain to maintain the data structure.'
          : '无法移除此列: \n\n因为表格至少需要保留一列来维持数据结构。',
      );
    }
  };

  const handleJsonChange = (e) => {
    const newJsonText = e.target.value;
    setJsonText(newJsonText);
    try {
      const formattedJsonText = formatJson(newJsonText);
      console.log('Formatted JSON:', formattedJsonText); // 调试输出格式化后的 JSON
      const newData = JSON.parse(formattedJsonText);
      console.log('Parsed Data:', newData); // 调试输出解析后的数据
      const newDataArray = [
        Object.keys(newData[0]),
        ...newData.map(Object.values),
      ];
      if (hotInstance.current) {
        hotInstance.current.loadData(newDataArray);
        setTableData(newData);
        localStorage.setItem('handsontableData', JSON.stringify(newData));
      }
    } catch (error) {
      console.error('Invalid JSON format', error);
      // 可以在这里添加 UI 反馈
      alert('Invalid JSON format: ' + error.message);
    }
  };

  const formatJson = (jsonText) => {
    // 替换 id, label, logo, status 等键以及它们的值为标准的双引号形式
    return jsonText
      .replace(/([a-zA-Z]+):/g, '"$1":')
      .replace(/'/g, '"')
      .replace(/`/g, '"');
  };

  const copyJsonToClipboard = () => {
    navigator.clipboard.writeText(jsonText);
    alert(
      lang == '0' ? 'JSON data copied to clipboard!' : 'JSON数据已复制到剪贴板',
    );
  };

  const copyTableToClipboard = () => {
    if (hotInstance.current) {
      const data = hotInstance.current.getData();
      const dataString = data.map((row) => row.join('\t')).join('\n');
      navigator.clipboard.writeText(dataString).then(() => {
        alert(
          lang == '0'
            ? 'Table data copied to clipboard!'
            : '表格数据已复制到剪贴板',
        );
      });
    }
  };

  return (
    <div
      className={`flex h-screen ${isTableFullScreen || isJsonFullScreen ? '' : 'flex-col md:flex-row'} rounded-[28px] p-4 overflow-hidden`}
    >
      <div className='fixed z-50 top-8 left-8'>
        <a href='http://xianzhe.site'>
          <button className={ButtonStyle + 'bg-blue-500'}>
            {lang == '0' ? 'Home' : '返回主页'}
          </button>
        </a>
        <button onClick={resetData} className={ButtonStyle + 'bg-red-500'}>
          {lang == '0' ? 'New' : '新建'}
        </button>
        <button onClick={removeRow} className={ButtonStyle + 'bg-green-500'}>
          {lang == '0' ? 'Delete Row' : '删除行'}
        </button>
        <button
          onClick={removeColumn}
          className={ButtonStyle + 'bg-yellow-500'}
        >
          {lang == '0' ? 'Delete Column' : '删除列'}
        </button>
      </div>
      <div className='z-40 flex justify-end w-full'>
        {!isJsonFullScreen && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={
              isTableFullScreen ? FullScreen : `relative w-full md:w-1/2 p-4`
            }
          >
            <motion.div layout className='flex justify-end mb-8'>
              <div>
                <button
                  onClick={copyTableToClipboard}
                  className={ButtonStyle + 'bg-gray-500'}
                >
                  {lang == '0' ? 'Copy' : ' 复制 Table 数据'}
                </button>
                <button
                  onClick={() => setIsTableFullScreen(!isTableFullScreen)}
                  className={ButtonStyle + 'bg-indigo-500'}
                >
                  {isTableFullScreen
                    ? lang == '0'
                      ? 'Exit'
                      : '退出全屏'
                    : lang == '0'
                      ? 'Fullscreen'
                      : '全屏表格'}
                </button>
              </div>
            </motion.div>
            <motion.div
              layout
              className='w-full h-[90%] rounded-[28px] overflow-hidden border border-gray-300 focus:border-blue-500'
            >
              <motion.div className='w-full h-[100%] overflow-auto pb-[0vh]'>
                <div
                  ref={hotRef}
                  className={`w-full h-full pb-4 scrollbar-auto overflow-hidden`}
                ></div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
        {!isTableFullScreen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout
            className={`flex relative w-full md:w-1/2 p-4 `}
          >
            <motion.div
              layout
              className={
                isJsonFullScreen ? FullScreen : 'flex flex-col w-full h-full '
              }
            >
              <div className='flex justify-end mb-8 '>
                <button
                  onClick={copyJsonToClipboard}
                  className={ButtonStyle + 'bg-gray-500'}
                >
                  {lang == '0' ? 'Copy' : '复制 JSON 数据'}
                </button>
                <button
                  onClick={() => setIsJsonFullScreen(!isJsonFullScreen)}
                  className={ButtonStyle + 'bg-indigo-500'}
                >
                  {isJsonFullScreen ? 'Exit' : '全屏 JSON'}
                </button>
              </div>
              <div className='rounded-[28px] overflow-hidden w-full h-[90%]'>
                <textarea
                  value={jsonText}
                  onChange={handleJsonChange}
                  className={`w-full h-full p-[28px] pb-[50vh] z-0 rounded-[28px] overflow-auto border border-gray-300`}
                ></textarea>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EditableGrid;
