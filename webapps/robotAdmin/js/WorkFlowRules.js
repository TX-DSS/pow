var COS_Flow_Rules = {
    TypeDefine: {
        "BeginActivity": {
            "type": "1",
            "subType": null
        },
        "EndActivity": {
            "type": "2",
            "subType": null
        },
        "Process_Root": {
            "type": "0",
            "subType": "1"
        },
        "Process_Sub": {
            "type": "0",
            "subType": "80"
        },
        "Process_Gen": {
            "type": "0",
            "subType": "88"
        },
        "DynamicActivity": {
            "type": "99",
            "subType": null
        },
        "ManualActivity_Manual": {
            "type": "5",
            "subType": "1"
        },
        "ManualActivity_Robot": {
            "type": "5",
            "subType": "2"
        },
        "DummyActivity": {
            "type": "3",
            "subType": null
        }
    },
    DefaultAttributes: {
        ActivityAttrs: {
            "code": null,
            "name": "",
            "title": "",
            "description": null,
            "type": "",
            "subType": "",
            "isAbnormal": "0",
            "costTime": "0",
            "canObtainTime": "0",
            "timeLengthToEnd": "0",
            "assignStrategy": "0",
            "assignJavaClass": null,
            "assignFactor": null,
            "completeStrategy": "0",
            "completeJavaClass": null,
            "completeFactor": null,
            "splitStrategy": "5",
            "splitJavaClass": null,
            "splitFactor": null,
            "joinStrategy": "5",
            "joinJavaClass": null,
            "joinFactor": null,
            "obtainType": "2",
            "role": null,
            "roleName": null,
            "legalExecutorType": "0",
            "legalExecutor": null,
            "tempType": null,
            "status": null
        },
        TranRefDataAttrs: {
            "tranRefDataTitle1": null,
            "tranRefDataTitle2": null,
            "tranRefDataTitle3": null,
            "tranRefDataTitle4": null,
            "tranRefDataTitle5": null,
            "tranRefDataTitle6": null,
            "tranRefDataTitle7": null,
            "tranRefDataTitle8": null
        },   
        RouteAttrs: {
            "routeType": "0",
            "description": null,
            "additionalOperation": "0"
        },
        RouteActivityAttrs: {
            "activityName": "",
            "displayLabel": ""
        },
        ExpressionAttrs: {
            "conditionExpression": ""
        }
    },
    AttrsInputProperty: {
        "name": {
            title: "名称",
            type: "01"
        },
        "code": {
            title: "编码",
            type: "01"
        },
        "description": {
            title: "活动描述",
            type: "02"
        },
        "isAbnormal": {
            title: "非正常活动节点",
            type: "21"
        },
        "legalExecutorType": {
            title: "法定执行者类型",
            type: "11",
            selectList: {
                "0": "角色",
                "1": "人",
                "2": "机构",
                "3": "某前动作执行者",
                "4": "某前动作领导",
                "5": "某前动作排除执行者"
            }
        },
        "legalExecutor": {
            title: "法定执行者",
            type: "12",
            selectList: {
                "0": "角色",
                "1": "人",
                "2": "机构",
                "3": "某前动作执行者",
                "4": "某前动作领导",
                "5": "某前动作同角色中除去"
            }
        },
        "canObtainTime": {
            title: "获取超时时间(秒)",
            type: "01"
        },
        "costTime": {
            title: "估计完成时间(秒)",
            type: "01"
        },
        "role": {
            title: "角色",
            type: "01"
        },
        "tempType": {
            title: "模板类型",
            type: "11",
            selectList: {
                "0": "主流程模板",
                "1": "子流程模板",
                "2": "ocr录入模板",
                "3": "一次录入模板",
                "4": "二次录入模板"
            }
        },
        "assignStrategy": {
            title: "分配策略",
            type: "11",
            selectList: {
                "0": "不推自取",
                "1": "分到单人",
                "2": "分到全部人",
                "3": "分配到多人",
                "4": "外部分配类"
            }
        },
        "assignJavaClass": {
            title: "分配外部类",
            type: "01"
        },
        "assignFactor": {
            title: "分配因子",
            type: "01"
        },
        "completeStrategy": {
            title: "完成策略",
            type: "11",
            selectList: {
                "0": "单项完成",
                "5": "全部完成",
                "10": "多项完成",
                "20": "外部完成类"
            }
        },
        "completeJavaClass": {
            title: "完成外部类",
            type: "01"
        },
        "completeFactor": {
            title: "完成因子",
            type: "01"
        },
        "splitStrategy": {
            title: "分支策略",
            type: "11",
            selectList: {
                "0": "单路分支",
                "5": "全部分支",
                "10": "多路分支",
                "20": "外部分支类",
                "30": "动态分支",
                "40": "完全动态分支"
            }
        },
        "splitJavaClass": {
            title: "分支外部类",
            type: "01"
        },
        "splitFactor": {
            title: "分支因子",
            type: "01"
        },
        "joinStrategy": {
            title: "合并策略",
            type: "11",
            selectList: {
                "0": "单路首次合并",
                "1": "单路每次合并",
                "5": "全部合并",
                "10": "多路合并",
                "20": "外部合并类"
            }
        },
        "joinJavaClass": {
            title: "合并外部类",
            type: "01"
        },
        "joinFactor": {
            title: "合并因子",
            type: "01"
        },
        "tranRefDataTitle1": {
            title: "相关数据1",
            type: "01"
        },
        "tranRefDataTitle2": {
            title: "相关数据2",
            type: "01"
        },
        "tranRefDataTitle3": {
            title: "相关数据3",
            type: "01"
        },
        "tranRefDataTitle4": {
            title: "相关数据4",
            type: "01"
        },
        "tranRefDataTitle5": {
            title: "相关数据5",
            type: "01"
        },
        "tranRefDataTitle6": {
            title: "相关数据6",
            type: "01"
        },
        "tranRefDataTitle7": {
            title: "相关数据7",
            type: "01"
        },
        "tranRefDataTitle8": {
            title: "相关数据8",
            type: "01"
        },
        "routeType": {
            title: "路由类型",
            type: "11",
            selectList: {
                "0": "正常",
                "1": "异常",
                "2": "打回"
            }
        },
        "additionalOperation": {
            title: "附加操作",
            type: "11",
            selectList: {
                "0": "无附加操作",
                "1": "终止连线两端及中间活动环节",
                "2": "删除连线两端及中间活动环节"//,
                //"3": "终止线段终点及其以后所有活动节点",
                //"4": "删除线段终点及其以后所有活动节点"
            }
        },
        "description": {
            title: "路由描述",
            type: "02"
        },
        "conditionExpression": {
            title: "路由表达式",
            type: "02"
        }
    },
    SettingInputLists: {
        "property": {
            title: "属性设置",
            inputList: [
                "name",
                "code",
                "description"
            ]
        },
        "advanced": {
            title: "高级设置",
            inputList: [
                "isAbnormal",
                "legalExecutorType",
                "legalExecutor",
                "canObtainTime",
                "costTime",
                "role",
                "tempType",
            ]
        },
        "related": {
            title: "相关数据设置",
            inputList: [
                "tranRefDataTitle1",
                "tranRefDataTitle2",
                "tranRefDataTitle3",
                "tranRefDataTitle4",
                "tranRefDataTitle5",
                "tranRefDataTitle6",
                "tranRefDataTitle7",
                "tranRefDataTitle8",
            ]
        },
        "assign": {
            title: "分配设置",
            inputList: [
                "assignStrategy",
                "assignJavaClass",
                "assignFactor"
            ]
        },
        "complete": {
            title: "完成设置",
            inputList: [
                "completeStrategy",
                "completeJavaClass",
                "completeFactor"
            ]
        },
        "split": {
            title: "分支设置",
            inputList: [
                "splitStrategy",
                "splitJavaClass",
                "splitFactor"
            ]
        },
        "join": {
            title: "合并设置",
            inputList: [
                "joinStrategy",
                "joinJavaClass",
                "joinFactor"
            ]
        },
        "routeInfo": {
            title: "路由信息设置",
            inputList: [
                "routeType",
                "additionalOperation",
                "conditionExpression",
                "description"
            ]
        }
    }
}