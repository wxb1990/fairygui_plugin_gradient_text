"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const csharp_1 = require("csharp");
const App = csharp_1.FairyEditor.App;
App.pluginManager.LoadUIPackage(App.pluginManager.basePath + "/" + eval("__dirname") + '/CustomInspector');
var GradientDir;
(function (GradientDir) {
    GradientDir["up"] = "up";
    GradientDir["down"] = "down";
    GradientDir["left"] = "left";
    GradientDir["right"] = "right";
})(GradientDir || (GradientDir = {}));
class GradientColorInspector extends csharp_1.FairyEditor.View.PluginInspector {
    constructor() {
        super();
        this.regText = /^\[color=([\w#,]+)\](.*)/;
        // private up: FairyEditor.Component.ColorInput;
        // private down: FairyEditor.Component.ColorInput;
        // private left: FairyEditor.Component.ColorInput;
        // private right: FairyEditor.Component.ColorInput;
        this.inputs = {};
        this.colors = {};
        this.dirs = [GradientDir.up, GradientDir.down, GradientDir.left, GradientDir.right];
        console.log("Gradient!!!!!!!!!!");
        this.panel = csharp_1.FairyGUI.UIPackage.CreateObject("CustomInspector", "GradientColor").asCom;
        this.ctrl_vertical = this.panel.GetController("vertical");
        this.ctrl_horizontal = this.panel.GetController("horizontal");
        for (const key in this.dirs) {
            let dir = this.dirs[key];
            // console.log(dir)
            let n = this.panel.GetChild(dir);
            let input = n.GetChild("color");
            this.inputs[dir] = input;
            input.AddEventListener(csharp_1.FairyEditor.FEvents.SUBMIT, (context) => {
                console.log(dir, input.colorValue);
                this.set_color(dir, input.colorValue);
            });
            // input.onFocusOut.Add(() => {
            //     // console.log(`${dir}.onFocusOut`);
            //     FairyGUI.Timers.inst.CallLater(() => {
            //     });
            // });
        }
        this.check_vertical = this.panel.GetChild("check_vertical").asButton;
        this.check_vertical.selected = false;
        this.check_vertical.onChanged.Add(() => {
            // console.log("check_vertical:", this.check_vertical.selected)
            let sels = App.activeDoc.inspectingTargets;
            let obj = sels.get_Item(0);
            let color = obj.color;
            if (!this.colors[GradientDir.up]) {
                this.init_dir_color(GradientDir.up, color);
            }
            if (!this.colors[GradientDir.down]) {
                this.init_dir_color(GradientDir.down, color);
            }
            this.update_colors();
        });
        this.check_horizontal = this.panel.GetChild("check_horizontal").asButton;
        this.check_horizontal.selected = false;
        this.check_horizontal.onChanged.Add(() => {
            let obj = App.activeDoc.inspectingTarget;
            // console.log("check_horizontal:", this.check_horizontal.selected)
            if (this.check_horizontal.selected) {
                let sels = App.activeDoc.inspectingTargets;
                let obj = sels.get_Item(0);
                let color = obj.color;
                if (!this.colors[GradientDir.left]) {
                    this.init_dir_color(GradientDir.left, color);
                }
                if (!this.colors[GradientDir.right]) {
                    this.init_dir_color(GradientDir.right, color);
                }
                if (!this.check_vertical.selected) {
                    // this.init_dir_color(GradientDir.up, color);
                    // this.init_dir_color(GradientDir.down, color);
                }
            }
            this.update_colors();
        });
        this.updateAction = () => { return this.update_colors(); };
    }
    init_dir_color(dir, color) {
        this.colors[dir] = color;
        this.inputs[dir].colorValue = color;
    }
    update_colors() {
        let sels = App.activeDoc.inspectingTargets;
        let obj = sels.get_Item(0);
        if (obj != this.last_obj) {
            console.log("obj != this.last_obj");
            this.init_data();
            this.last_obj = obj;
        }
        console.log("update_colors");
        // this.combo.value = obj.customData
        for (let index = 0; index < sels.Count; index++) {
            let element = sels.get_Item(index);
            if (element) {
                this.update_color(element);
            }
        }
        return true; //if everything is ok, return false to hide the inspector
    }
    set_color(dir, color) {
        if (this.colors[dir] == color)
            return;
        this.colors[dir] = color;
        this.update_colors();
    }
    update_color(text_field) {
        // let text_field = App.activeDoc.inspectingTarget as FairyEditor.FTextField;
        let text = text_field.text;
        let m = text.match(this.regText);
        if (m) {
            text = m[2];
        }
        let color = this.get_color_text();
        text = color + text;
        if (text != text_field.text) {
            text_field.docElement.SetProperty("text", text);
        }
        if (color.length > 0) {
            this.customDataObj["gradient"] = color;
        }
        else {
            delete this.customDataObj["gradient"];
        }
        if (Object.keys(this.customDataObj).length > 0) {
            var json = JSON.stringify(this.customDataObj);
            if (json != text_field.customData) {
                text_field.docElement.SetProperty("customData", json);
            }
        }
        else {
            if (text_field.customData != null && text_field.customData.length > 0) {
                text_field.docElement.SetProperty("customData", "");
            }
            // text_field.docElement.SetProperty("customData", null)
            // text_field.customData = "";
        }
    }
    get_color_text() {
        if (!this.check_vertical.selected && !this.check_horizontal.selected)
            return "";
        let s = "[color=";
        if (this.check_vertical.selected) {
            s += csharp_1.FairyEditor.ColorUtil.ToHexString(this.get_dir_color(GradientDir.up));
            s += "," + csharp_1.FairyEditor.ColorUtil.ToHexString(this.get_dir_color(GradientDir.down));
        }
        else if (this.check_horizontal.selected) {
            let obj = App.activeDoc.inspectingTarget;
            // let color = obj.color
            let color = csharp_1.UnityEngine.Color.white;
            s += csharp_1.FairyEditor.ColorUtil.ToHexString(color);
            s += "," + csharp_1.FairyEditor.ColorUtil.ToHexString(color);
        }
        if (this.check_horizontal.selected) {
            s += "," + csharp_1.FairyEditor.ColorUtil.ToHexString(this.get_dir_color(GradientDir.left));
            s += "," + csharp_1.FairyEditor.ColorUtil.ToHexString(this.get_dir_color(GradientDir.right));
        }
        else {
        }
        return s + "]";
    }
    get_dir_color(dir) {
        if (this.colors[dir]) {
            return this.colors[dir];
        }
        let obj = App.activeDoc.inspectingTarget;
        return obj.color;
    }
    init_data() {
        // 使用customData
        // 使用ubb数据
        // 使用文本颜色
        // this.check_vertical.selected = false
        // this.check_horizontal.selected = false
        this.colors = {};
        let sels = App.activeDoc.inspectingTargets;
        let obj = sels.get_Item(0);
        this.customDataObj = null;
        try {
            this.customDataObj = JSON.parse(obj.customData);
        }
        catch (error) {
            console.log("json error:", error);
        }
        let color = "";
        if (this.customDataObj) {
            color = this.customDataObj.gradient ? this.customDataObj.gradient : "";
        }
        else {
            this.customDataObj = {};
            let text = obj.text;
            let m = text.match(this.regText);
            if (m) {
                color = m[1];
            }
        }
        let reg = /(#\w+)/g;
        let r;
        let i = 0;
        while (r = reg.exec(color)) {
            let color_hex = r[1];
            let dir = this.dirs[i];
            this.colors[dir] = csharp_1.FairyEditor.ColorUtil.FromHexString(color_hex);
            this.inputs[dir].colorValue = this.colors[dir];
            i++;
        }
        this.check_vertical.selected = Object.keys(this.colors).length >= 2;
        this.check_horizontal.selected = Object.keys(this.colors).length >= 4;
    }
}
//Register a inspector
App.inspectorView.AddInspector(() => new GradientColorInspector(), "GradientColorJS", "渐变");
//Condition to show it
// App.docFactory.ConnectInspector("GradientColorJS", "mixed", false, false);
App.docFactory.ConnectInspector("GradientColorJS", "text", false, false);
