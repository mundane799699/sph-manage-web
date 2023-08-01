<template>
  <div>
    <el-card style="margin: 20px 0px">
      <CategorySelect
        @getCategoryId="getCategoryId"
        :show="scene !== 0"
      ></CategorySelect>
    </el-card>
    <el-card>
      <div v-show="scene === 0">
        <el-button
          style="margin: 10px 0px"
          type="primary"
          icon="el-icon-plus"
          :disabled="!category3Id"
          @click="addSpu"
          >添加SPU</el-button
        >
        <el-table style="width: 100%" border="" :data="records">
          <el-table-column type="index" label="序号" width="80" align="center">
          </el-table-column>
          <el-table-column prop="spuName" label="SPU名称" width="width">
          </el-table-column>
          <el-table-column prop="description" label="SPU描述" width="width">
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{ row }">
              <HintButton
                type="success"
                icon="el-icon-plus"
                size="mini"
                title="添加sku"
                @click="addSku(row)"
              ></HintButton>
              <HintButton
                type="warning"
                icon="el-icon-edit"
                size="mini"
                title="修改spu"
                @click="updateSpu(row)"
              ></HintButton>
              <HintButton
                type="info"
                icon="el-icon-info"
                size="mini"
                title="查看当前spu全部sku列表"
                @click="handler(row)"
              ></HintButton>
              <el-popconfirm
                title="这是一段内容确定删除吗？"
                @onConfirm="deleteSpu(row)"
              >
                <HintButton
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  title="删除spu"
                  slot="reference"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          style="text-align: center"
          :current-page="page"
          :page-sizes="[3, 5, 10]"
          :page-size="limit"
          layout="prev, pager, next, jumper, ->, sizes, total"
          :total="total"
          @current-change="getSpuList"
          @size-change="handleSizeChange"
        >
        </el-pagination>
      </div>
      <SpuForm
        v-show="scene === 1"
        @changeScene="changeScene"
        ref="spu"
      ></SpuForm>
      <SkuForm
        v-show="scene === 2"
        @changeScene="changeScene"
        ref="sku"
      ></SkuForm>
    </el-card>
    <el-dialog
      :title="`${spu.spuName}的sku列表`"
      :visible.sync="dialogTableVisible"
      :before-close="close"
    >
      <el-table :data="skuList" style="width: 100%" border v-loading="loading">
        <el-table-column property="skuName" label="名称"></el-table-column>
        <el-table-column property="price" label="价格"></el-table-column>
        <el-table-column property="weight" label="重量"></el-table-column>
        <el-table-column property="address" label="默认图片">
          <template slot-scope="{ row }">
            <img
              :src="row.skuDefaultImg"
              alt=""
              style="width: 100px; height: 100px"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import SpuForm from "./SpuForm";
import SkuForm from "./SkuForm";
export default {
  name: "Spu",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      page: 1, //当前第几页
      limit: 3, // 每页展示条数
      records: [],
      total: 0,
      scene: 0, // 0表示展示SPU列表数据 1表示添加SPU|修改SPU 2表示添加SKU
      dialogTableVisible: false,
      spu: {},
      skuList: [],
      loading: true,
    };
  },
  methods: {
    getCategoryId(cForm) {
      const { category1Id, category2Id, category3Id } = cForm;
      this.category1Id = category1Id;
      this.category2Id = category2Id;
      this.category3Id = category3Id;
      if (category3Id) {
        this.getSpuList();
      }
    },
    async getSpuList(pager = 1) {
      this.page = pager;
      const { page, limit, category3Id } = this;
      let result = await this.$API.spu.reqSpuList(page, limit, category3Id);
      if (result.code === 200) {
        this.total = result.data.total;
        this.records = result.data.records;
      }
    },
    handleSizeChange(limit) {
      this.limit = limit;
      this.getSpuList();
    },
    addSpu() {
      this.scene = 1;
      this.$refs.spu.addSpuData(this.category3Id);
    },
    updateSpu(row) {
      this.scene = 1;
      this.$refs.spu.initSpuData(row);
    },
    changeScene({ scene, saveType }) {
      this.scene = scene;
      if (saveType === "修改") {
        this.getSpuList(this.page);
      } else if (saveType === "添加") {
        this.getSpuList();
      }
    },
    async deleteSpu(row) {
      let result = await this.$API.spu.reqDeleteSpu(row.id);
      if (result.code === 200) {
        this.$message({ type: "success", message: "删除成功" });
        let pager = this.records.length > 1 ? this.page : this.page - 1;
        if (pager < 1) {
          pager = 1;
        }
        this.getSpuList(pager);
      }
    },
    addSku(row) {
      this.scene = 2;
      this.$refs.sku.getData(this.category1Id, this.category2Id, row);
    },
    // 查看sku列表
    async handler(spu) {
      this.dialogTableVisible = true;
      this.spu = spu;
      let result = await this.$API.spu.reqSkuList(spu.id);
      if (result.code === 200) {
        this.skuList = result.data;
        this.loading = false;
      }
    },
    close(done) {
      this.loading = true;
      this.skuList = [];
      done();
    },
  },
  components: {
    SpuForm,
    SkuForm,
  },
};
</script>

<style lang="scss" scoped>
</style>