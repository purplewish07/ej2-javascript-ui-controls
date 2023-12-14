/* eslint-disable */
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.editingResources = [
        { resourceId: 1, resourceName: 'Martin Tamer' },
        { resourceId: 2, resourceName: 'Rose Fuller' },
        { resourceId: 3, resourceName: 'Margaret Buchanan' },
        { resourceId: 4, resourceName: 'Fuller King' },
        { resourceId: 5, resourceName: 'Davolio Fuller' },
        { resourceId: 6, resourceName: 'Van Jack' },
        { resourceId: 7, resourceName: 'Fuller Buchanan' },
        { resourceId: 8, resourceName: 'Jack Davolio' },
        { resourceId: 9, resourceName: 'Tamer Vinet' },
        { resourceId: 10, resourceName: 'Vinet Fuller' },
        { resourceId: 11, resourceName: 'Bergs Anton' },
        { resourceId: 12, resourceName: 'Construction Supervisor' }
    ];
    exports.editingData = [
        {
            TaskID: 1,
            TaskName: 'P511-1100715001',
            StartDate: new Date('07/15/2021'),
            EndDate: new Date('08/24/2021'),
            subtasks: [
                {
                    TaskID: 2, TaskName: '切管', StartDate: new Date('07/15/2021'), EndDate: new Date('07/26/2021'),
                    planStartDate: new Date('07/15/2021'), planEndDate: new Date('07/26/2021'),
                    Progress: 30, info: ''
                },
                {
                    TaskID: 3, TaskName: '研磨', StartDate: new Date('07/27/2021'), EndDate: new Date('07/29/2021'),
                    Progress: 0, info: '', Predecessor:2
                },
				{
                    TaskID: 4, TaskName: '退火', StartDate: new Date('07/30/2021'), EndDate: new Date('08/04/2021'),
                    Progress: 0, info: '', Predecessor:3
                },
				{
                    TaskID: 5, TaskName: '電鍍-半光錫', StartDate: new Date('08/05/2021'), EndDate: new Date('08/18/2021'),
                    Progress: 0, info: '', Predecessor:4
                },
				{
                    TaskID: 6, TaskName: 'QC檢驗一', StartDate: new Date('08/19/2021'), EndDate: new Date('08/19/2021'),
                    Progress: 0, info: '', Predecessor:5
                },
				{
                    TaskID: 7, TaskName: '包裝', StartDate: new Date('08/20/2021'), EndDate: new Date('08/24/2021'),
                    Progress: 0, info: '', Predecessor:6
                },
            ]
        },
		{
            TaskID: 8,
            TaskName: 'P511-1100715003',
            StartDate: new Date('07/15/2021'),
            EndDate: new Date('08/25/2021'),
            subtasks: [
                {
                    TaskID: 9, TaskName: '切管', StartDate: new Date('07/15/2021'), EndDate: new Date('07/27/2021'),
                    Progress: 30, info: ''
                },
                {
                    TaskID: 10, TaskName: '研磨', StartDate: new Date('07/28/2021'), EndDate: new Date('07/30/2021'),
                    Progress: 0, info: '', Predecessor:9
                },
				{
                    TaskID: 11, TaskName: '退火', StartDate: new Date('08/02/2021'), EndDate: new Date('08/05/2021'),
                    Progress: 0, info: '', Predecessor:10
                },
				{
                    TaskID: 12, TaskName: '電鍍-半光錫', StartDate: new Date('08/06/2021'), EndDate: new Date('08/19/2021'),
                    Progress: 0, info: '', Predecessor:11
                },
				{
                    TaskID: 13, TaskName: 'QC檢驗一', StartDate: new Date('08/20/2021'), EndDate: new Date('08/20/2021'),
                    Progress: 0, info: '', Predecessor:12
                },
				{
                    TaskID: 14, TaskName: '包裝', StartDate: new Date('08/23/2021'), EndDate: new Date('08/25/2021'),
                    Progress: 0, info: '', Predecessor:13
                },
            ]
        },
		{
            TaskID: 15,
            TaskName: 'P511-1100715004',
            StartDate: new Date('07/15/2021'),
            EndDate: new Date('08/26/2021'),
            subtasks: [
                {
                    TaskID: 16, TaskName: '切管', StartDate: new Date('07/15/2021'), EndDate: new Date('07/28/2021'),
                    Progress: 30, info: ''
                },
                {
                    TaskID: 17, TaskName: '研磨', StartDate: new Date('07/29/2021'), EndDate: new Date('08/02/2021'),
                    Progress: 0, info: '', Predecessor:16
                },
				{
                    TaskID: 18, TaskName: '退火', StartDate: new Date('08/03/2021'), EndDate: new Date('08/06/2021'),
                    Progress: 0, info: '', Predecessor:17
                },
				{
                    TaskID: 19, TaskName: '電鍍-半光錫', StartDate: new Date('08/09/2021'), EndDate: new Date('08/20/2021'),
                    Progress: 0, info: '', Predecessor:18
                },
				{
                    TaskID: 20, TaskName: 'QC檢驗一', StartDate: new Date('08/23/2021'), EndDate: new Date('08/23/2021'),
                    Progress: 0, info: '', Predecessor:19
                },
				{
                    TaskID: 21, TaskName: '包裝', StartDate: new Date('08/24/2021'), EndDate: new Date('08/26/2021'),
                    Progress: 0, info: '', Predecessor:20
                },
            ]
        },
		
    ];
	exports.machine_LoadingData = [
        {
            TaskID: 'MX',
            TaskName: '',
            subtasks: [
                {
                    TaskID: 'MX1', TaskName: 'P511-1100715001', StartDate: new Date('07/15/2021 8:00:00'), EndDate: new Date('07/19/2021'),
                    Progress: 30, info: ''
                },{
                    TaskID: 'MX1', TaskName: 'P511-1100715001', StartDate: new Date('07/20/2021'), EndDate: new Date('07/26/2021'),
                    Progress: 30, info: ''
                },
                {
                    TaskID: 'MX2', TaskName: 'P511-1100715001', StartDate: new Date('07/27/2021'), EndDate: new Date('07/29/2021'),
                    Progress: 0, info: ''
                },
				{
                    TaskID: 'MX3', TaskName: 'P511-1100715001', StartDate: new Date('07/30/2021'), EndDate: new Date('08/04/2021'),
                    Progress: 0, info: ''
                },

			],
		}
		
    ];
	exports.machine_workData = [
        {
            TaskID: 'MX',
            TaskName: '切管機',
            subtasks: [
                { TaskID: 'MX1', TaskName: '切管01' },
				{ TaskID: 'MX2', TaskName: '切管02' },
				{ TaskID: 'MX3', TaskName: '切管03' },
				{ TaskID: 'MX4', TaskName: '切管04' },
				{ TaskID: 'MX5', TaskName: '切管05' },
				{ TaskID: 'MX6', TaskName: '切管06' },
				{ TaskID: 'MX7', TaskName: '切管07' },
				{ TaskID: 'MX8', TaskName: '切管08' },
				{ TaskID: 'MX9', TaskName: '切管09' },
				{ TaskID: 'MX10', TaskName: '切管10' },
				{ TaskID: 'MX11', TaskName: '切管11' },
				{ TaskID: 'MX12', TaskName: '切管12' },
				{ TaskID: 'MX13', TaskName: '切管13' },
				{ TaskID: 'MX14', TaskName: '切管14' },
			],
		}
		
    ];


});