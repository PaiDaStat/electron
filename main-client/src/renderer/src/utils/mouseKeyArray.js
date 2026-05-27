// 键盘基本按键区域
import reduce from '../assets/keyIcon/reduce-icon.webp' // 缩小
import zoomIn from '../assets/keyIcon/zoomIn-icon.webp' // 放大
import reset from '../assets/keyIcon/reset-icon.webp' // 复位
import recovery from '../assets/keyIcon/recovery-icon.webp' // 恢复
import undo from '../assets/keyIcon/undo-icon.webp' // 撤销
import selectAll from '../assets/keyIcon/selectAll-icon.webp' // 全选
import create from '../assets/keyIcon/create-icon.webp' // 新建
import copy from '../assets/keyIcon/copy-icon.webp' // 复制
import cut from '../assets/keyIcon/cut-icon.webp' // 剪切
import paste from '../assets/keyIcon/paste-icon.webp' // 粘贴
import save from '../assets/keyIcon/save-icon.webp' // 保存
import open from '../assets/keyIcon/open-icon.webp' // 打开
import newItem from '../assets/keyIcon/newItem-icon.webp' // 新建项
import closeItem from '../assets/keyIcon/closeItem-icon.webp' // 关闭项
import back from '../assets/keyIcon/back-icon.webp' // 后退(键盘)
import forward from '../assets/keyIcon/forward-icon.webp' // 前进(键盘)
import taskBar from '../assets/keyIcon/taskBar-icon.webp' // 任务栏
import openDescription from '../assets/keyIcon/openDescription-icon.webp' // 打开叙述
import loopTaskBarApp from '../assets/keyIcon/loopTaskBarApp-icon.webp' // 循环任务栏应用程序
import actionCenter from '../assets/keyIcon/actionCenter-icon.webp' // 行动中心
import fileExplorer from '../assets/keyIcon/fileExplorer-icon.webp' // 文件资源管理器
import windowsSettingsCenter from '../assets/keyIcon/windowsSettingsCenter-icon.webp' // Windows设置中心
import castToOtherDevice from '../assets/keyIcon/castToOtherDevice-icon.webp' // 投屏到其他设备
import jumpToTray from '../assets/keyIcon/jumpToTray-icon.webp' // 跳转到托盘
import startXboxGameBar from '../assets/keyIcon/startXboxGameBar-icon.webp' // 启动xbox游戏栏
import run from '../assets/keyIcon/run-icon.webp' // 运行
import search from '../assets/keyIcon/search-icon.webp' // 搜索
import displaySettings from '../assets/keyIcon/displaySettings-icon.webp' // 显示设置
import simpleMenu from '../assets/keyIcon/simpleMenu-icon.webp' // 简易菜单
import emojiBox from '../assets/keyIcon/emojiBox-icon.webp' // 表情框
import startMenu from '../assets/keyIcon/startMenu-icon.webp' // 开始菜单
import switchWindow from '../assets/keyIcon/switchWindow-icon.webp' // 转换窗口
import endApp from '../assets/keyIcon/endApp-icon.webp' // 结束应用
import switchToNextApp from '../assets/keyIcon/switchToNextApp-icon.webp' // 切换到下一个应用
import mouseRight from '../assets/keyIcon/mouseLeft-icon.webp' // 鼠标左键
import mouseLeft from '../assets/keyIcon/mouseRight-icon.webp' // 鼠标右键
import mouseMiddle from '../assets/keyIcon/mouseMiddle-icon.webp' // 鼠标中键
import mouseForward from '../assets/keyIcon/mouseForward-icon.webp' // 鼠标前进
import mouseBackward from '../assets/keyIcon/mouseBackward-icon.webp' // 鼠标后退
import mouseWheelUp from '../assets/keyIcon/mouseWheelUp-icon.webp' // 鼠标滚轮上
import mouseWheelDown from '../assets/keyIcon/mouseWheelDown-icon.webp' // 鼠标滚轮下
import playPause from '../assets/keyIcon/playPause-icon.webp' // 播放/暂停
import mute from '../assets/keyIcon/mute-icon.webp' // 静音
import stopPlay from '../assets/keyIcon/stopPlay-icon.webp' // 停止播放
import previousTrack from '../assets/keyIcon/previousTrack-icon.webp' // 上一曲
import nextTrack from '../assets/keyIcon/nextTrack-icon.webp' // 下一曲
import volumeUp from '../assets/keyIcon/volumeUp-icon.webp' // 音量+
import volumeDown from '../assets/keyIcon/volumeDown-icon.webp' // 音量-
import browserHomeIcon from '../assets/keyIcon/browserHomeIcon-icon.webp' // 浏览器首页
import calculator from '../assets/keyIcon/calculator-icon.webp' // 计算器
import email from '../assets/keyIcon/email-icon.webp' // 邮箱
import computer from '../assets/keyIcon/computer-icon.webp' // 计算机
import bookmark from '../assets/keyIcon/bookmark-icon.webp' // 收藏夹
import closeWindow from '../assets/keyIcon/closeWindow-icon.webp' // 关闭窗口
import lockComputer from '../assets/keyIcon/lockComputer-icon.webp' // 计算机锁定
import showDesktop from '../assets/keyIcon/showDesktop-icon.webp' // 显示桌面
import windowsSecurityScreen from '../assets/keyIcon/windowsSecurityScreen-icon.webp' // Windows安全屏幕
import taskManager from '../assets/keyIcon/taskManager-icon.webp' // 任务管理器
import screenBrightnessUp from '../assets/keyIcon/screenBrightnessUp-icon.webp' // 屏幕亮度+
import screenBrightnessDown from '../assets/keyIcon/screenBrightnessDown-icon.webp' // 屏幕亮度-



export function keyArray() {
    return [
        {
            title: "基础字符",
            keys: [
                {
                    keyName: 'A',
                    name: 'A',
                    keyId: 10000,
                    KeyCode: '20 00 04',
                    tip: 'A键'
                },
                {
                    keyName: 'B',
                    name: 'B',
                    keyId: 10000,
                    KeyCode: '20 00 05',
                },
                {
                    keyName: 'C',
                    name: 'C',
                    keyId: 10000,
                    KeyCode: '20 00 06',
                },
                {
                    keyName: 'D',
                    name: 'D',
                    keyId: 10000,
                    KeyCode: '20 00 07',
                },
                {
                    keyName: 'E',
                    name: 'E',
                    keyId: 10000,
                    KeyCode: '20 00 08',
                },
                {
                    keyName: 'F',
                    name: 'F',
                    keyId: 10000,
                    KeyCode: '20 00 09',
                },
                {
                    keyName: 'G',
                    name: 'G',
                    keyId: 10000,
                    KeyCode: '20 00 0A',
                },
                {
                    keyName: 'H',
                    name: 'H',
                    keyId: 10000,
                    KeyCode: '20 00 0B',
                },
                {
                    keyName: 'I',
                    name: 'I',
                    keyId: 10000,
                    KeyCode: '20 00 0C',
                },
                {
                    keyName: 'J',
                    name: 'J',
                    keyId: 10000,
                    KeyCode: '20 00 0D',
                },
                {
                    keyName: 'K',
                    name: 'K',
                    keyId: 10000,
                    KeyCode: '20 00 0E',
                },
                {
                    keyName: 'L',
                    name: 'L',
                    keyId: 10000,
                    KeyCode: '20 00 0F',
                },
                {
                    keyName: 'M',
                    name: 'M',
                    keyId: 10000,
                    KeyCode: '20 00 10',
                },
                {
                    keyName: 'N',
                    name: 'N',
                    keyId: 10000,
                    KeyCode: '20 00 11',
                },
                {
                    keyName: 'O',
                    name: 'O',
                    keyId: 10000,
                    KeyCode: '20 00 12',
                },
                {
                    keyName: 'P',
                    name: 'P',
                    keyId: 10000,
                    KeyCode: '20 00 13',
                },
                {
                    keyName: 'Q',
                    name: 'Q',
                    keyId: 10000,
                    KeyCode: '20 00 14',
                },
                {
                    keyName: 'R',
                    name: 'R',
                    keyId: 10000,
                    KeyCode: '20 00 15',
                },
                {
                    keyName: 'S',
                    name: 'S',
                    keyId: 10000,
                    KeyCode: '20 00 16',
                },
                {
                    keyName: 'T',
                    name: 'T',
                    keyId: 10000,
                    KeyCode: '20 00 17',
                },
                {
                    keyName: 'U',
                    name: 'U',
                    keyId: 10000,
                    KeyCode: '20 00 18',
                },
                {
                    keyName: 'V',
                    name: 'V',
                    keyId: 10000,
                    KeyCode: '20 00 19',
                },
                {
                    keyName: 'W',
                    name: 'W',
                    keyId: 10000,
                    KeyCode: '20 00 1A',
                },
                {
                    keyName: 'X',
                    name: 'X',
                    keyId: 10000,
                    KeyCode: '20 00 1B',
                },
                {
                    keyName: 'Y',
                    name: 'Y',
                    keyId: 10000,
                    KeyCode: '20 00 1C',
                },
                {
                    keyName: 'Z',
                    name: 'Z',
                    keyId: 10000,
                    KeyCode: '20 00 1D',
                },
                {
                    keyName: '1!',
                    name: '1!',
                    keyId: 10000,
                    KeyCode: '20 00 1E',
                },
                {
                    keyName: '2@',
                    name: '2@',
                    keyId: 10000,
                    KeyCode: '20 00 1F',
                },
                {
                    keyName: '3#',
                    name: '3#',
                    keyId: 10000,
                    KeyCode: '20 00 20',
                },
                {
                    keyName: '4$',
                    name: '4$',
                    keyId: 10000,
                    KeyCode: '20 00 21',
                },
                {
                    keyName: '5%',
                    name: '5%',
                    keyId: 10000,
                    KeyCode: '20 00 22',
                },
                {
                    keyName: '6^',
                    name: '6^',
                    keyId: 10000,
                    KeyCode: '20 00 23',
                },
                {
                    keyName: '7&',
                    name: '7&',
                    keyId: 10000,
                    KeyCode: '20 00 24',
                },
                {
                    keyName: '8*',
                    name: '8*',
                    keyId: 10000,
                    KeyCode: '20 00 25',
                },
                {
                    keyName: '9(',
                    name: '9(',
                    keyId: 10000,
                    KeyCode: '20 00 26',
                },
                {
                    keyName: '0)',
                    name: '0)',
                    keyId: 10000,
                    KeyCode: '20 00 27',
                },
                {
                    keyName: '`~',
                    name: '`~',
                    keyId: 10000,
                    KeyCode: '20 00 35',
                },
                {
                    keyName: '-_',
                    name: '-_',
                    keyId: 10000,
                    KeyCode: '20 00 2D',
                },
                {
                    keyName: '=+',
                    name: '=+',
                    keyId: 10000,
                    KeyCode: '20 00 2E',
                },
                {
                    keyName: '[{',
                    name: '[{',
                    keyId: 10000,
                    KeyCode: '20 00 2F',
                },
                {
                    keyName: ']}',
                    name: ']}',
                    keyId: 10000,
                    KeyCode: '20 00 30',
                },
                {
                    keyName: '\\|',
                    name: '\\|',
                    keyId: 10000,
                    KeyCode: '20 00 31',
                },
                {
                    keyName: ';:',
                    name: ';:',
                    keyId: 10000,
                    KeyCode: '20 00 33',
                },
                {
                    keyName: '\'"',
                    name: '\'"',
                    keyId: 10000,
                    KeyCode: '20 00 34',
                },
                {
                    keyName: ',<',
                    name: ',<',
                    keyId: 10000,
                    KeyCode: '20 00 36',
                },
                {
                    keyName: '.>',
                    name: '.>',
                    keyId: 10000,
                    KeyCode: '20 00 37',
                },
                {
                    keyName: '/?',
                    name: '/?',
                    keyId: 10000,
                    KeyCode: '20 00 38',
                },
                {
                    keyName: 'Esc',
                    name: 'Esc',
                    keyId: 10000,
                    KeyCode: '20 00 29',
                },
                {
                    keyName: 'Tab',
                    name: 'Tab',
                    keyId: 10000,
                    KeyCode: '20 00 2B',
                },
                {
                    keyName: 'Caps——Lock',
                    name: 'Caps——Lock',
                    keyId: 10000,
                    KeyCode: '20 00 39',
                },
                {
                    keyName: 'Backs——pace',
                    name: 'Backs——pace',
                    keyId: 10000,
                    KeyCode: '20 00 2A',
                },
                {
                    keyName: 'Space',
                    name: 'Space',
                    keyId: 10000,
                    KeyCode: '20 00 2C',
                },
                {
                    keyName: 'Menu',
                    name: 'Menu',
                    keyId: 10000,
                    KeyCode: '20 00 65',
                },
                {
                    keyName: 'Enter',
                    name: 'Enter',
                    keyId: 10000,
                    KeyCode: '20 00 28',
                },
                {
                    keyName: 'Left——Shift',
                    name: 'Left——Shift',
                    keyId: 10000,
                    KeyCode: '20 02 00',
                },
                {
                    keyName: 'Right——Shift',
                    name: 'Right——Shift',
                    keyId: 10000,
                    KeyCode: '20 20 00',
                },
                {
                    keyName: 'Left——Ctrl',
                    name: 'Left——Ctrl',
                    keyId: 10000,
                    KeyCode: '20 01 00',
                },
                {
                    keyName: 'Right——Ctrl',
                    name: 'Right——Ctrl',
                    keyId: 10000,
                    KeyCode: '20 10 00',
                },
                {
                    keyName: 'Left——Alt',
                    name: 'Left——Alt',
                    keyId: 10000,
                    KeyCode: '20 04 00',
                },
                {
                    keyName: 'Right——Alt',
                    name: 'Right——Alt',
                    keyId: 10000,
                    KeyCode: '20 40 00',
                },
                {
                    keyName: 'Left——Win',
                    name: 'Left——Win',
                    keyId: 10000,
                    KeyCode: '20 08 00',
                },
                {
                    keyName: 'Right——Win',
                    name: 'Right——Win',
                    keyId: 10000,
                    KeyCode: '20 80 00',
                },
                {
                    keyName: 'F1',
                    name: 'F1',
                    keyId: 10000,
                    KeyCode: '20 00 3A',
                },
                {
                    keyName: 'F2',
                    name: 'F2',
                    keyId: 10000,
                    KeyCode: '20 00 3B',
                },
                {
                    keyName: 'F3',
                    name: 'F3',
                    keyId: 10000,
                    KeyCode: '20 00 3C',
                },
                {
                    keyName: 'F4',
                    name: 'F4',
                    keyId: 10000,
                    KeyCode: '20 00 3D',
                },
                {
                    keyName: 'F5',
                    name: 'F5',
                    keyId: 10000,
                    KeyCode: '20 00 3E',
                },
                {
                    keyName: 'F6',
                    name: 'F6',
                    keyId: 10000,
                    KeyCode: '20 00 3F',
                },
                {
                    keyName: 'F7',
                    name: 'F7',
                    keyId: 10000,
                    KeyCode: '20 00 40',
                },
                {
                    keyName: 'F8',
                    name: 'F8',
                    keyId: 10000,
                    KeyCode: '20 00 41',
                },
                {
                    keyName: 'F9',
                    name: 'F9',
                    keyId: 10000,
                    KeyCode: '20 00 42',
                },
                {
                    keyName: 'F10',
                    name: 'F10',
                    keyId: 10000,
                    KeyCode: '20 00 43',
                },
                {
                    keyName: 'F11',
                    name: 'F11',
                    keyId: 10000,
                    KeyCode: '20 00 44',
                },
                {
                    keyName: 'F12',
                    name: 'F12',
                    keyId: 10000,
                    KeyCode: '20 00 45',
                },
                {
                    keyName: 'Insert',
                    name: 'Insert',
                    keyId: 10000,
                    KeyCode: '20 00 49',
                },
                {
                    keyName: 'Home',
                    name: 'Home',
                    keyId: 10000,
                    KeyCode: '20 00 4A',
                },
                {
                    keyName: 'Page——Up',
                    name: 'Page——Up',
                    keyId: 10000,
                    KeyCode: '20 00 4B',
                },
                {
                    keyName: 'Page——Down',
                    name: 'Page——Down',
                    keyId: 10000,
                    KeyCode: '20 00 4E',
                },
                {
                    keyName: 'End',
                    name: 'End',
                    keyId: 10000,
                    KeyCode: '20 00 4D',
                },
                {
                    keyName: 'Delete',
                    name: 'Delete',
                    keyId: 10000,
                    KeyCode: '20 00 4C',
                },
                {
                    keyName: '↑',
                    name: '↑',
                    keyId: 10000,
                    KeyCode: '20 00 52',
                },
                {
                    keyName: '↓',
                    name: '↓',
                    keyId: 10000,
                    KeyCode: '20 00 51',
                },
                {
                    keyName: '←',
                    name: '←',
                    keyId: 10000,
                    KeyCode: '20 00 50',
                },
                {
                    keyName: '→',
                    name: '→',
                    keyId: 10000,
                    KeyCode: '20 00 4F',
                },
                {
                    keyName: 'Print——Screen',
                    name: 'Print——Screen',
                    keyId: 10000,
                    KeyCode: '20 00 46',
                },
                {
                    keyName: 'Pause',
                    name: 'Pause',
                    keyId: 10000,
                    KeyCode: '20 00 48',
                },
                {
                    keyName: 'Scroll——Lock',
                    name: 'Scroll——Lock',
                    keyId: 10000,
                    KeyCode: '20 00 47',
                },
                {
                    keyName: 'Num——Lock',
                    name: 'Num——Lock',
                    keyId: 10000,
                    KeyCode: '20 00 53',
                },
                {
                    keyName: 'Num /',
                    name: 'Num /',
                    keyId: 10000,
                    KeyCode: '20 00 54',
                },
                {
                    keyName: 'Num *',
                    name: 'Num *',
                    keyId: 10000,
                    KeyCode: '20 00 55',
                },
                {
                    keyName: 'Num -',
                    name: 'Num -',
                    keyId: 10000,
                    KeyCode: '20 00 56',
                },
                {
                    keyName: 'Num +',
                    name: 'Num +',
                    keyId: 10000,
                    KeyCode: '20 00 57',
                },
                {
                    keyName: 'Num——Enter',
                    name: 'Num——Enter',
                    keyId: 10000,
                    KeyCode: '20 00 58',
                },
                {
                    keyName: 'Num——Del',
                    name: 'Num——Del',
                    keyId: 10000,
                    KeyCode: '20 00 63',
                },
                {
                    keyName: 'Num 1',
                    name: 'Num 1',
                    keyId: 10000,
                    KeyCode: '20 00 59',
                },
                {
                    keyName: 'Num 2',
                    name: 'Num 2',
                    keyId: 10000,
                    KeyCode: '20 00 5A',
                },
                {
                    keyName: 'Num 3',
                    name: 'Num 3',
                    keyId: 10000,
                    KeyCode: '20 00 5B',
                },
                {
                    keyName: 'Num 4',
                    name: 'Num 4',
                    keyId: 10000,
                    KeyCode: '20 00 5C',
                },
                {
                    keyName: 'Num 5',
                    name: 'Num 5',
                    keyId: 10000,
                    KeyCode: '20 00 5D',
                },
                {
                    keyName: 'Num 6',
                    name: 'Num 6',
                    keyId: 10000,
                    KeyCode: '20 00 5E',
                },
                {
                    keyName: 'Num 7',
                    name: 'Num 7',
                    keyId: 10000,
                    KeyCode: '20 00 5F',
                },
                {
                    keyName: 'Num 8',
                    name: 'Num 8',
                    keyId: 10000,
                    KeyCode: '20 00 60',
                },
                {
                    keyName: 'Num 9',
                    name: 'Num 9',
                    keyId: 10000,
                    KeyCode: '20 00 61',
                },
                {
                    keyName: 'Num 0',
                    name: 'Num 0',
                    keyId: 10000,
                    KeyCode: '20 00 62',
                },
                {
                    keyName: 'Fn',
                    name: 'Fn',
                    keyId: 10000,
                    KeyCode: 'A0 01 00',
                },
                {
                    keyName: 'Fn2',
                    name: 'Fn2',
                    keyId: 10000,
                    KeyCode: 'A0 D1 00',
                },
            ]
        },
        {
            title: "鼠标功能",
            keys: [
                {
                    keyName: '鼠标左键',
                    name: '鼠标左键',
                    keyId: 10000,
                    KeyCode: '10 01 00',
                    icon: mouseLeft,
                    tips: '鼠标左键',
                },
                {
                    keyName: '鼠标右键',
                    name: '鼠标右键',
                    keyId: 10000,
                    KeyCode: '10 02 00',
                    icon: mouseRight,
                    tips: '鼠标右键',
                },
                {
                    keyName: '鼠标中键',
                    name: '鼠标中键',
                    keyId: 10000,
                    KeyCode: '10 04 00',
                    icon: mouseMiddle,
                    tips: '鼠标中键',
                },
                {
                    keyName: '鼠标前进',
                    name: '鼠标前进',
                    keyId: 10000,
                    KeyCode: '10 10 00',
                    icon: mouseForward,
                    tips: '鼠标前进',
                },
                {
                    keyName: '鼠标后退',
                    name: '鼠标后退',
                    keyId: 10000,
                    KeyCode: '10 08 00',
                    icon: mouseBackward,
                    tips: '鼠标后退',
                },
                {
                    keyName: '滚轮上',
                    name: '滚轮上',
                    keyId: 10000,
                    KeyCode: '12 00 FF',
                    icon: mouseWheelUp,
                    tips: '滚轮上',
                },
                {
                    keyName: '滚轮下',
                    name: '滚轮下',
                    keyId: 10000,
                    KeyCode: '12 00 01',
                    icon: mouseWheelDown,
                    tips: '滚轮下',
                },
            ]
        },
        {
            title: "特殊字符",
            keys: [
                {
                    keyName: '缩小',
                    name: '缩小',
                    keyId: 10000,
                    KeyCode: '20 01 2D',
                    icon: reduce,
                    tips: '缩小',
                },
                {
                    keyName: '放大',
                    name: '放大',
                    keyId: 10000,
                    KeyCode: '20 01 2E',
                    icon: zoomIn,
                    tips: '放大',
                },
                {
                    keyName: '复位',
                    name: '复位',
                    keyId: 10000,
                    KeyCode: '20 01 27',
                    icon: reset,
                    tips: '复位',
                },
                {
                    keyName: '恢复',
                    name: '恢复',
                    keyId: 10000,
                    KeyCode: '20 01 1C',
                    icon: recovery,
                    tips: '恢复',
                },
                {
                    keyName: '撤销',
                    name: '撤销',
                    keyId: 10000,
                    KeyCode: '20 01 1D',
                    icon: undo,
                    tips: '撤销',
                },
                {
                    keyName: '全选',
                    name: '全选',
                    keyId: 10000,
                    KeyCode: '20 01 04',
                    icon: selectAll,
                    tips: '全选',
                },
                {
                    keyName: '新建',
                    name: '新建',
                    keyId: 10000,
                    KeyCode: '20 01 11',
                    icon: create,
                    tips: '新建',
                },
                {
                    keyName: '复制',
                    name: '复制',
                    keyId: 10000,
                    KeyCode: '20 01 06',
                    icon: copy,
                    tips: '复制',
                },
                {
                    keyName: '剪切',
                    name: '剪切',
                    keyId: 10000,
                    KeyCode: '20 01 1B',
                    icon: cut,
                    tips: '剪切',
                },
                {
                    keyName: '粘贴',
                    name: '粘贴',
                    keyId: 10000,
                    KeyCode: '20 01 19',
                    icon: paste,
                    tips: '粘贴',
                },
                {
                    keyName: '保存',
                    name: '保存',
                    keyId: 10000,
                    KeyCode: '20 01 16',
                    icon: save,
                    tips: '保存',
                },
                {
                    keyName: '打开',
                    name: '打开',
                    keyId: 10000,
                    KeyCode: '20 01 12',
                    icon: open,
                    tips: '打开',
                },
                {
                    keyName: '新建项',
                    name: '新建项',
                    keyId: 10000,
                    KeyCode: '20 01 17',
                    icon: newItem,
                    tips: '新建项',
                },
                {
                    keyName: '关闭项',
                    name: '关闭项',
                    keyId: 10000,
                    KeyCode: '20 01 1A',
                    icon: closeItem,
                    tips: '关闭项',
                },
                {
                    keyName: '后退(键盘)',
                    name: '后退(键盘)',
                    keyId: 10000,
                    KeyCode: '20 04 50',
                    icon: back,
                    tips: '后退(键盘)',
                },
                {
                    keyName: '前进(键盘)',
                    name: '前进(键盘)',
                    keyId: 10000,
                    KeyCode: '20 04 4F',
                    icon: forward,
                    tips: '前进(键盘)',
                },
                {
                    keyName: '任务栏',
                    name: '任务栏',
                    keyId: 10000,
                    KeyCode: '20 08 2B',
                    icon: taskBar,
                    tips: '任务栏',
                },
                {
                    keyName: '打开叙述',
                    name: '打开叙述',
                    keyId: 10000,
                    KeyCode: '20 09 58',
                    icon: openDescription,
                    tips: '打开叙述',
                },
                {
                    keyName: '循环任务栏应用程序',
                    name: '循环任务栏应用程序',
                    keyId: 10000,
                    KeyCode: '20 08 17',
                    icon: loopTaskBarApp,
                    tips: '循环任务栏应用程序',
                },
                {
                    keyName: '行动中心',
                    name: '行动中心',
                    keyId: 10000,
                    KeyCode: '20 08 04',
                    icon: actionCenter,
                    tips: '行动中心',
                },
                {
                    keyName: '文件资源管理器',
                    name: '文件资源管理器',
                    keyId: 10000,
                    KeyCode: '20 08 08',
                    icon: fileExplorer,
                    tips: '文件资源管理器',
                },
                {
                    keyName: 'Windows设置中心',
                    name: 'Windows设置中心',
                    keyId: 10000,
                    KeyCode: '20 08 0C',
                    icon: windowsSettingsCenter,
                    tips: 'Windows设置中心',
                },
                {
                    keyName: '投屏到其他设备',
                    name: '投屏到其他设备',
                    keyId: 10000,
                    KeyCode: '20 08 0E',
                    icon: castToOtherDevice,
                    tips: '投屏到其他设备',
                },
                {
                    keyName: '跳转到托盘',
                    name: '跳转到托盘',
                    keyId: 10000,
                    KeyCode: '20 08 05',
                    icon: jumpToTray,
                    tips: '跳转到托盘',
                },
                {
                    keyName: '启动xbox游戏栏',
                    name: '启动xbox游戏栏',
                    keyId: 10000,
                    KeyCode: '20 08 0A',
                    icon: startXboxGameBar,
                    tips: '启动xbox游戏栏',
                },
                {
                    keyName: '运行',
                    name: '运行',
                    keyId: 10000,
                    KeyCode: '20 08 15',
                    icon: run,
                    tips: '运行',
                },
                {
                    keyName: '搜索',
                    name: '搜索',
                    keyId: 10000,
                    KeyCode: '20 08 16',
                    icon: search,
                    tips: '搜索',
                },
                {
                    keyName: '显示设置',
                    name: '显示设置',
                    keyId: 10000,
                    KeyCode: '20 08 18',
                    icon: displaySettings,
                    tips: '显示设置',
                },
                {
                    keyName: '简易菜单',
                    name: '简易菜单',
                    keyId: 10000,
                    KeyCode: '20 08 1B',
                    icon: simpleMenu,
                    tips: '简易菜单',
                },
                {
                    keyName: '表情框',
                    name: '表情框',
                    keyId: 10000,
                    KeyCode: '20 08 37',
                    icon: emojiBox,
                    tips: '表情框',
                },
                {
                    keyName: '开始菜单',
                    name: '开始菜单',
                    keyId: 10000,
                    KeyCode: '20 01 29',
                    icon: startMenu,
                    tips: '开始菜单',
                },
                {
                    keyName: '转换窗口',
                    name: '转换窗口',
                    keyId: 10000,
                    KeyCode: '20 04 2B',
                    icon: switchWindow,
                    tips: '转换窗口',
                },
                {
                    keyName: '结束应用',
                    name: '结束应用',
                    keyId: 10000,
                    KeyCode: '20 04 3D',
                    icon: endApp,
                    tips: '结束应用',
                },
                {
                    keyName: '切换到下一个应用',
                    name: '切换到下一个应用',
                    keyId: 10000,
                    KeyCode: '20 04 29',
                    icon: switchToNextApp,
                    tips: '切换到下一个应用',
                },

                {
                    keyName: '播放/暂停',
                    name: '播放/暂停',
                    keyId: 10000,
                    KeyCode: '30 CD 00',
                    icon: playPause,
                    tips: '播放/暂停',
                },
                {
                    keyName: '静音',
                    name: '静音',
                    keyId: 10000,
                    KeyCode: '30 E2 00',
                    icon: mute,
                    tips: '静音',
                },
                {
                    keyName: '停止播放',
                    name: '停止播放',
                    keyId: 10000,
                    KeyCode: '30 B7 00',
                    icon: stopPlay,
                    tips: '停止播放',
                },
                {
                    keyName: '上一曲',
                    name: '上一曲',
                    keyId: 10000,
                    KeyCode: '30 B6 00',
                    icon: previousTrack,
                    tips: '上一曲',
                },
                {
                    keyName: '下一曲',
                    name: '下一曲',
                    keyId: 10000,
                    KeyCode: '30 B5 00',
                    icon: nextTrack,
                    tips: '下一曲',
                },
                {
                    keyName: '音量+',
                    name: '音量+',
                    keyId: 10000,
                    KeyCode: '30 E9 00',
                    icon: volumeUp,
                    tips: '音量+',
                },
                {
                    keyName: '音量-',
                    name: '音量-',
                    keyId: 10000,
                    KeyCode: '30 EA 00',
                    icon: volumeDown,
                    tips: '音量-',
                },
                {
                    keyName: '浏览器主页',
                    name: '浏览器主页',
                    keyId: 10000,
                    KeyCode: '30 23 02',
                    icon: browserHomeIcon,
                    tips: '浏览器主页',
                },
                {
                    keyName: '计算器',
                    name: '计算器',
                    keyId: 10000,
                    KeyCode: '30 92 01',
                    icon: calculator,
                    tips: '计算器',
                },
                {
                    keyName: '邮件',
                    name: '邮件',
                    keyId: 10000,
                    KeyCode: '30 8A 01',
                    icon: email,
                    tips: '邮件',
                },
                {
                    keyName: '我的电脑',
                    name: '我的电脑',
                    keyId: 10000,
                    KeyCode: '30 94 01',
                    icon: computer,
                    tips: '我的电脑',
                },
                {
                    keyName: '收藏夹',
                    name: '收藏夹',
                    keyId: 10000,
                    KeyCode: '30 2A 02',
                    icon: bookmark,
                    tips: '收藏夹',
                },
                {
                    keyName: '关闭窗口',
                    name: '关闭窗口',
                    keyId: 10000,
                    KeyCode: '20 40 3D',
                    icon: closeWindow,
                    tips: '关闭窗口',
                },
                {
                    keyName: '锁定计算机',
                    name: '锁定计算机',
                    keyId: 10000,
                    KeyCode: '20 08 0F',
                    icon: lockComputer,
                    tips: '锁定计算机',
                },
                {
                    keyName: '显示桌面',
                    name: '显示桌面',
                    keyId: 10000,
                    KeyCode: '20 08 07',
                    icon: showDesktop,
                    tips: '显示桌面',
                },
                {
                    keyName: 'Windows安全屏幕',
                    name: 'Windows安全屏幕',
                    keyId: 10000,
                    KeyCode: '20 05 4C',
                    icon: windowsSecurityScreen,
                    tips: 'Windows安全屏幕',
                },
                {
                    keyName: '任务管理器',
                    name: '任务管理器',
                    keyId: 10000,
                    KeyCode: '20 03 29',
                    icon: taskManager,
                    tips: '任务管理器',
                },
                {
                    keyName: '屏幕亮度+',
                    name: '屏幕亮度+',
                    keyId: 10000,
                    KeyCode: '30 6F 00',
                    icon: screenBrightnessUp,
                    tips: '屏幕亮度+',
                },
                {
                    keyName: '屏幕亮度-',
                    name: '屏幕亮度-',
                    keyId: 10000,
                    KeyCode: '30 70 00',
                    icon: screenBrightnessDown,
                    tips: '屏幕亮度-',
                },
            ]
        }
    ]
}
