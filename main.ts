import { FairyGUI, FairyEditor, UnityEngine, System } from 'csharp';

const App = FairyEditor.App;

App.pluginManager.LoadUIPackage(App.pluginManager.basePath + "/" + eval("__dirname") + '/CustomInspector')

enum GradientDir {
    up = "up",
    down = "down",
    left = "left",
    right = "right",
}

class GradientColorInspector extends FairyEditor.View.PluginInspector {


    private readonly regText: RegExp = /^\[color=([\w#,]+)\](.*)/
    // private combo: FairyGUI.GComboBox;
    private check_vertical: FairyGUI.GButton;
    private check_horizontal: FairyGUI.GButton;
    private ctrl_vertical: FairyGUI.Controller;
    private ctrl_horizontal: FairyGUI.Controller;
    // private up: FairyEditor.Component.ColorInput;
    // private down: FairyEditor.Component.ColorInput;
    // private left: FairyEditor.Component.ColorInput;
    // private right: FairyEditor.Component.ColorInput;
    private inputs: { [key: string]: FairyEditor.Component.ColorInput } = {};
    private colors: { [key: string]: UnityEngine.Color } = {};
    private last_obj: FairyEditor.FObject;
    private readonly dirs = [GradientDir.up, GradientDir.down, GradientDir.left, GradientDir.right]
    private customDataObj:{[key:string]:any}

    public constructor() {
        super();
        console.log("Gradient!!!!!!!!!!")
        this.panel = FairyGUI.UIPackage.CreateObject("CustomInspector", "GradientColor").asCom;
        this.ctrl_vertical = this.panel.GetController("vertical");
        this.ctrl_horizontal = this.panel.GetController("horizontal");
        for (const key in this.dirs) {
            let dir = this.dirs[key]
            // console.log(dir)
            let n = this.panel.GetChild(dir) as FairyGUI.GComponent
            let input = n.GetChild("color") as FairyEditor.Component.ColorInput
            this.inputs[dir] = input;
            input.AddEventListener(FairyEditor.FEvents.SUBMIT, (context: FairyGUI.EventContext) => {
                console.log(dir, input.colorValue);
                this.set_color(dir, input.colorValue);
            })
            // input.onFocusOut.Add(() => {
            //     // console.log(`${dir}.onFocusOut`);
            //     FairyGUI.Timers.inst.CallLater(() => {
                    
            //     });
            // });
        }

        this.check_vertical = this.panel.GetChild("check_vertical").asButton;
        this.check_vertical.selected = false
        this.check_vertical.onChanged.Add(() => {
            // console.log("check_vertical:", this.check_vertical.selected)
            let sels = App.activeDoc.inspectingTargets
            let obj = sels.get_Item(0) as FairyEditor.FTextField;
            let color = obj.color
            if (!this.colors[GradientDir.up]) {
                this.init_dir_color(GradientDir.up, color);
            }
            if (!this.colors[GradientDir.down]) {
                this.init_dir_color(GradientDir.down, color);
            }

            this.update_colors()
        });
        this.check_horizontal = this.panel.GetChild("check_horizontal").asButton;
        this.check_horizontal.selected = false
        this.check_horizontal.onChanged.Add(() => {
            let obj = App.activeDoc.inspectingTarget
            // console.log("check_horizontal:", this.check_horizontal.selected)
            if (this.check_horizontal.selected) {
                let sels = App.activeDoc.inspectingTargets
                let obj = sels.get_Item(0) as FairyEditor.FTextField;
                let color = obj.color
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
            this.update_colors()
        });

        this.updateAction = () => { return this.update_colors(); };
    }

    private init_dir_color(dir: GradientDir, color: UnityEngine.Color) {
        this.colors[dir] = color;
        this.inputs[dir].colorValue = color
    }

    private update_colors(): boolean {
        let sels = App.activeDoc.inspectingTargets as System.Collections.Generic.List$1<FairyEditor.FObject>
        let obj = sels.get_Item(0);
        if (obj != this.last_obj) {
            console.log("obj != this.last_obj")
            this.init_data()
            this.last_obj = obj
        }
        console.log("update_colors")
        // this.combo.value = obj.customData
        for (let index = 0; index < sels.Count; index++) {
            let element = sels.get_Item(index);
            if (element as FairyEditor.FTextField) {
                this.update_color(element as FairyEditor.FTextField)
            }
        }

        return true; //if everything is ok, return false to hide the inspector
    }

    private set_color(dir: GradientDir, color: UnityEngine.Color) {
        if (this.colors[dir] == color) return;
        this.colors[dir] = color;
        this.update_colors()
    }

    private update_color(text_field: FairyEditor.FTextField) {
        // let text_field = App.activeDoc.inspectingTarget as FairyEditor.FTextField;
        let text = text_field.text;
        let m = text.match(this.regText)
        if (m) {
            text = m[2];
        }

        let color = this.get_color_text()
        text = color + text;
        if (text != text_field.text) {
            text_field.docElement.SetProperty("text", text)
        }
        if (color.length > 0) {
            this.customDataObj["gradient"] = color
        } else {
            delete this.customDataObj["gradient"]
            
        }
        if (Object.keys(this.customDataObj).length > 0) {
            var json = JSON.stringify(this.customDataObj)
            if (json != text_field.customData) {
                text_field.docElement.SetProperty("customData", json)
            }
            
        } else {
            if (text_field.customData != null && text_field.customData.length > 0) {
                text_field.docElement.SetProperty("customData", "")
            }
            // text_field.docElement.SetProperty("customData", null)
            // text_field.customData = "";
        }
    }

    private get_color_text(): string {
        if (!this.check_vertical.selected && !this.check_horizontal.selected) return "";
        let s = "[color="
        if (this.check_vertical.selected ) {
            s += FairyEditor.ColorUtil.ToHexString(this.get_dir_color(GradientDir.up))
            s += "," + FairyEditor.ColorUtil.ToHexString(this.get_dir_color(GradientDir.down))
        } else if (this.check_horizontal.selected) {
            let obj = App.activeDoc.inspectingTarget as FairyEditor.FTextField;
            // let color = obj.color
            let color = UnityEngine.Color.white
            s += FairyEditor.ColorUtil.ToHexString(color)
            s += "," + FairyEditor.ColorUtil.ToHexString(color)
        }
        
        if (this.check_horizontal.selected) {
            s += "," + FairyEditor.ColorUtil.ToHexString(this.get_dir_color(GradientDir.left))
            s += "," + FairyEditor.ColorUtil.ToHexString(this.get_dir_color(GradientDir.right))
        } else {

        }
        return s + "]"
    }

    private get_dir_color(dir:GradientDir): UnityEngine.Color {
        if (this.colors[dir]) {
            return this.colors[dir]
        }
        let obj = App.activeDoc.inspectingTarget as FairyEditor.FTextField;
        return obj.color
    }

    private init_data() {
        // 使用customData
        // 使用ubb数据
        // 使用文本颜色
        // this.check_vertical.selected = false
        // this.check_horizontal.selected = false
        this.colors = {}
        let sels = App.activeDoc.inspectingTargets
        let obj = sels.get_Item(0) as FairyEditor.FTextField;
        this.customDataObj = null
        try {
            this.customDataObj = JSON.parse(obj.customData)
        } catch (error) {
            console.log("json error:", error)
        }
        
        let color: string = ""
        if (this.customDataObj) {
            color = this.customDataObj.gradient ? this.customDataObj.gradient : ""
        } else {
            this.customDataObj = {}
            let text = obj.text
            let m = text.match(this.regText)
            if (m) {
                color = m[1];
            }
        }
        
        let reg = /(#\w+)/g
        let r: RegExpExecArray | null;
        let i = 0
        while (r = reg.exec(color)) {
            let color_hex = r[1];
            let dir = this.dirs[i]
            this.colors[dir] = FairyEditor.ColorUtil.FromHexString(color_hex)
            this.inputs[dir].colorValue = this.colors[dir]
            i++
        }
        this.check_vertical.selected = Object.keys(this.colors).length >= 2
        this.check_horizontal.selected = Object.keys(this.colors).length >= 4
    }
}

//Register a inspector
App.inspectorView.AddInspector(() => new GradientColorInspector(), "GradientColorJS", "渐变");
//Condition to show it
// App.docFactory.ConnectInspector("GradientColorJS", "mixed", false, false);
App.docFactory.ConnectInspector("GradientColorJS", "text", false, false);