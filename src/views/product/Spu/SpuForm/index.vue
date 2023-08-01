<template>
  <div>
    <el-form ref="form" label-width="80px" :model="spu">
      <el-form-item label="SPU名称">
        <el-input placeholder="SPU名称" v-model="spu.spuName"></el-input>
      </el-form-item>
      <el-form-item label="品牌">
        <el-select placeholder="请选择品牌" v-model="spu.tmId">
          <el-option
            :label="tm.tmName"
            :value="tm.id"
            v-for="tm in tradeMarkList"
            :key="tm.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述">
        <el-input
          type="textarea"
          rows="4"
          placeholder="描述"
          v-model="spu.description"
        ></el-input>
      </el-form-item>
      <el-form-item label="SPU图片">
        <el-upload
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-success="handleSuccess"
          :file-list="spuImageList"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-select
          :placeholder="`还有${unSelectedSaleAttr.length}未选择`"
          v-model="selectedAttr"
        >
          <el-option
            :label="attr.name"
            :value="attr"
            v-for="attr in unSelectedSaleAttr"
            :key="attr.id"
          ></el-option>
        </el-select>
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!selectedAttr"
          @click="addSaleAttr"
          >添加销售属性</el-button
        >
        <el-table style="width: 100%" border :data="spu.spuSaleAttrList">
          <el-table-column
            type="index"
            label="序号"
            width="80px"
            align="center"
          >
          </el-table-column>
          <el-table-column prop="saleAttrName" label="属性名" width="width">
          </el-table-column>
          <el-table-column prop="prop" label="属性值名称列表" width="width">
            <template slot-scope="{ row }">
              <el-tag
                :key="tag.id"
                v-for="(tag, index) in row.spuSaleAttrValueList"
                closable
                :disable-transitions="false"
                @close="row.spuSaleAttrValueList.splice(index, 1)"
              >
                {{ tag.saleAttrValueName }}
              </el-tag>
              <!-- @keyup.enter.native="handleInputConfirm"
                 -->
              <el-input
                class="input-new-tag"
                v-if="row.inputVisible"
                v-model="row.inputValue"
                ref="saveTagInput"
                size="small"
                @blur="handleInputConfirm(row)"
              >
              </el-input>
              <!-- @click="showInput" -->
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                @click="addSaleAttrValue(row)"
                >添加</el-button
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{ row, $index }">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="spu.spuSaleAttrList.splice($index, 1)"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addOrUpdateSpu">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "SpuForm",
  data() {
    return {
      dialogImageUrl: "",
      dialogVisible: false,
      spu: {
        category3Id: 0,
        description: "",
        spuImageList: [],
        spuName: "",
        // 品牌id
        tmId: "",
        spuSaleAttrList: [],
      },
      tradeMarkList: [], // 品牌信息
      spuImageList: [],
      saleAttrList: [], // 销售属性
      selectedAttr: undefined,
    };
  },
  methods: {
    handleRemove(file, fileList) {
      console.log(file, fileList);
      this.spuImageList = fileList;
    },
    // 照片墙图片上传成功的回调
    handleSuccess(response, file, fileList) {
      this.spuImageList = fileList;
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    async initSpuData(spu) {
      // 获取spu的信息
      let spuResult = await this.$API.spu.reqSpu(spu.id);
      if (spuResult.code === 200) {
        this.spu = spuResult.data;
      }
      // 获取品牌的信息
      let tradeMarkResult = await this.$API.spu.reqTradeMarkList();
      if (tradeMarkResult.code === 200) {
        this.tradeMarkList = tradeMarkResult.data;
      }
      // 获取spu图片信息
      let spuImageResult = await this.$API.spu.reqSpuImageList(spu.id);
      if (spuImageResult.code === 200) {
        spuImageResult.data.forEach((item) => {
          item.name = item.imgName;
          item.url = item.imgUrl;
        });
        this.spuImageList = spuImageResult.data;
      }
      // 获取平台全部的销售属性
      let saleResult = await this.$API.spu.reqBaseSaleAttrList();
      if (saleResult.code === 200) {
        this.saleAttrList = saleResult.data;
      }
    },
    addSaleAttr() {
      // 把选中的销售属性添加到spu.spuSaleAttrList
      let newSaleAttr = {
        baseSaleAttrId: this.selectedAttr.id,
        saleAttrName: this.selectedAttr.name,
        spuSaleAttrValueList: [],
      };
      this.spu.spuSaleAttrList.push(newSaleAttr);
      this.selectedAttr = undefined;
    },
    addSaleAttrValue(row) {
      this.$set(row, "inputVisible", true);
      this.$set(row, "inputValue", "");
    },
    handleInputConfirm(row) {
      const { baseSaleAttrId, inputValue } = row;
      if (inputValue.trim() === "") {
        this.$message("属性值不能为空");
        return;
      }
      // 不能重复
      let notRepeat = row.spuSaleAttrValueList.every(
        (item) => item.saleAttrValueName !== inputValue
      );
      if (!notRepeat) {
        this.$message("属性值不能重复");
        return;
      }
      row.inputVisible = false;
      const newSaleAttrValue = {
        baseSaleAttrId,
        saleAttrValueName: inputValue,
      };
      row.spuSaleAttrValueList.push(newSaleAttrValue);
    },
    async addOrUpdateSpu() {
      this.spu.spuImageList = this.spuImageList.map((item) => {
        return {
          imgName: item.name,
          imgUrl: (item.response && item.response.data) || item.url,
        };
      });
      let result = await this.$API.spu.reqAddOrUpdateSpu(this.spu);
      if (result.code === 200) {
        this.$message({ type: "success", message: "保存成功" });
        this.$emit("changeScene", {
          scene: 0,
          saveType: this.spu.id ? "修改" : "添加",
        });
      }
      // 清除数据
      Object.assign(this._data, this.$options.data());
    },
    async addSpuData(category3Id) {
      this.spu.category3Id = category3Id;
      // 获取品牌的信息
      let tradeMarkResult = await this.$API.spu.reqTradeMarkList();
      if (tradeMarkResult.code === 200) {
        this.tradeMarkList = tradeMarkResult.data;
      }
      // 获取平台全部的销售属性
      let saleResult = await this.$API.spu.reqBaseSaleAttrList();
      if (saleResult.code === 200) {
        this.saleAttrList = saleResult.data;
      }
    },
    cancel() {
      this.$emit("changeScene", {
        scene: 0,
        saveType: "",
      });
      // 清理数据
      // Object.assign: es6中新增的方法，可以合并对象
      // 组件实例this._data, 可以操作data当中的响应式数据
      // this.$options可以获取配置对象，配置对象的data函数执行，返回的响应式数据为空
      Object.assign(this._data, this.$options.data());
    },
  },
  computed: {
    unSelectedSaleAttr() {
      return this.saleAttrList.filter((item) => {
        return this.spu.spuSaleAttrList.every((item1) => {
          return item1.saleAttrName !== item.name;
        });
      });
    },
  },
};
</script>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>