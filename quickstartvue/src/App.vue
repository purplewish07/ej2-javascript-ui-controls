<style>
@import '../node_modules/@syncfusion/ej2-base/styles/material.css';
@import '../node_modules/@syncfusion/ej2-buttons/styles/material.css';
@import '../node_modules/@syncfusion/ej2-calendars/styles/material.css';
@import '../node_modules/@syncfusion/ej2-dropdowns/styles/material.css';
@import '../node_modules/@syncfusion/ej2-inputs/styles/material.css';
@import '../node_modules/@syncfusion/ej2-navigations/styles/material.css';
@import '../node_modules/@syncfusion/ej2-lists/styles/material.css';
@import '../node_modules/@syncfusion/ej2-layouts/styles/material.css';
@import '../node_modules/@syncfusion/ej2-popups/styles/material.css';
@import '../node_modules/@syncfusion/ej2-splitbuttons/styles/material.css';
@import '../node_modules/@syncfusion/ej2-grids/styles/material.css';
@import '../node_modules/@syncfusion/ej2-richtexteditor/styles/material.css';
@import '../node_modules/@syncfusion/ej2-treegrid/styles/material.css';
@import "../node_modules/@syncfusion/ej2-vue-gantt/styles/material.css";
</style>


<template>
  <div>
    <ejs-gantt ref='gantt' id="GanttContainer" :dataSource="data" :taskFields="taskFields" :height="height"
      :editSettings="editSettings" :editDialogFields="editDialogFields" :addDialogFields="addDialogFields"
      :toolbar="toolbar" :toolbarClick="toolbarClick" :resourceNameMapping="resourceNameMapping"
      :splitterSettings="splitterSettings"
      :renderBaseline="true" baselineColor='red'
      :resourceIDMapping="resourceIdMapping" :resources="resources" gridLines='Both' locale="zh-Hant"></ejs-gantt>
  </div>
</template>
<script>
import Vue from "vue";

import { GanttPlugin, Edit, Toolbar, Selection } from "@syncfusion/ej2-vue-gantt";
import { editingData, editingResources } from './data-source.js';
// import { EmitType } from '@syncfusion/ej2-base';
// import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { L10n, setCulture } from '@syncfusion/ej2-base';

//Load the loadCldr from ej2-base
// import { loadCldr } from '@syncfusion/ej2-base';
// import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
// import * as gregorian from 'cldr-data/main/zh-Hant/ca-gregorian.json';
// import * as numbers from 'cldr-data/main/zh-Hant/numbers.json';
// import * as timeZoneNames from 'cldr-data/main/zh-Hant/timeZoneNames.json';
// import * as weekData from 'cldr-data/supplemental/weekData.json';// To load the culture based first day of week
// loadCldr(numberingSystems, gregorian, numbers, timeZoneNames, weekData);

setCulture('zh-Hant');
L10n.load({
  'zh-Hant': {
    'gantt': {
      "name": "名稱",
      "startDate": "開始時間",
      "endDate": "結束時間",
      "duration": "期間",
      "progress": "進度",
      "add": "新增",
      "edit": "編輯",
      "update": "更新",
      "Sync": "同步更新",
      "saveButton": "確認",
      "cancel": "取消",
      "delete": "刪除",
      "expandAll": "展開",
      "collapseAll": "縮小",
      "addDialogTitle": "新增排程",
      "editDialogTitle": "排程資訊",
      "generalTab": "基本資料",
      "dependency": "相依設定",
      "notes": "註記",
      "resourceName": "負責人",
      "baselineStartDate": '預計開始',
      "baselineEndDate": '預計結束',

    }
  }
});

Vue.use(GanttPlugin);
export default {
  data: function () {
    return {
      data: editingData,
      height: '94%',
      taskFields: {
        id: 'TaskID',
        name: 'TaskName',
        startDate: 'StartDate',
        endDate: 'EndDate',
        baselineStartDate: 'planStartDate',
        baselineEndDate: 'planEndDate',
        duration: 'Duration',
        progress: 'Progress',
        dependency: 'Predecessor',
        child: 'subtasks',
        notes: 'info',
        resourceInfo: 'resources'
      },
      toolbar: ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll',
        'ZoomIn', 'ZoomOut', 'ZoomToFit',
        { text: '同步更新', tooltipText: '同步更新', id: 'Sync', prefixIcon: 'e-update' },],
      resourceNameMapping: 'resourceName',
      resourceIdMapping: 'resourceId',
      resources: editingResources,
      editSettings: {
        allowAdding: true,
        allowEditing: true,
        allowTaskbarEditing: true,
        allowDeleting: true,
        showDeleteConfirmDialog: true
      },
      editDialogFields: [
        { type: 'General' },
        { type: 'Dependency' },
        { type: 'Resources' },
        { type: 'Notes' }
      ],
      addDialogFields: [
        { type: 'General' },
        { type: 'Dependency' },
        { type: 'Resources' },
        { type: 'Notes' }
      ],
      toolbarClick(args) {
        if (args.item.id === 'Sync') {
          alert("同步更新中...");
        }
      },
      splitterSettings: {
        columnIndex: 3
      },


    };
  },
  provide: {
    gantt: [Edit, Toolbar, Selection]
  },
  methods: {
  }
};
</script>