# Markdown 组件测试文档

这是一份用于测试 Markdown 渲染的完整语法文档，涵盖常见 Markdown 元素。

---

## 1. 标题层级

# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题

---

## 2. 文本样式

**粗体文本** 和 *斜体文本*，以及 ***粗斜体***。

~~删除线文本~~

`行内代码` 用于突出显示代码或命令。

---

## 3. 引用块

> 这是一段引用文字。
> 可以跨多行书写。

> 嵌套引用
>> 第二层引用
>>> 第三层引用

---

## 4. 代码块

### 普通代码块（无语法高亮）

```
function hello() {
  console.log("Hello, World!");
}
```

### 带语言标识的代码块

```javascript
const greet = (name) => {
  return `Hello, ${name}!`;
};
greet("Markdown");
```

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)
```

```bash
npm install
npm run dev
```

```typescript
interface User {
  id: number;
  name: string;
}
```

---

## 5. 列表

### 无序列表

- 第一项
- 第二项
  - 嵌套项 A
  - 嵌套项 B
- 第三项

### 有序列表

1. 第一步
2. 第二步
3. 第三步

### 任务列表

- [x] 已完成任务
- [x] 另一个已完成
- [ ] 待办事项

---

## 6. 链接与图片

[普通链接](https://example.com)

[带标题的链接](https://example.com "点击访问")

---

## 7. 表格

| 表头 A | 表头 B | 表头 C |
|--------|--------|--------|
| 单元格 1 | 单元格 2 | 单元格 3 |
| 左对齐 | 居中 | 右对齐 |

| 语言 | 用途 |
|------|------|
| JavaScript | 前端开发 |
| Python | 数据分析 |
| Rust | 系统编程 |

---

## 8. 分隔线

---

***

___

---

## 9. 转义字符

\* 星号 \_ 下划线 \# 井号 \[ 方括号

---

## 10. 数学公式（如支持）

行内公式：$E = mc^2$

块级公式：

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

---

## 11. 混合内容示例

在段落中嵌入 **粗体**、*斜体*、`代码` 和 [链接](https://leyen.me)。

> 引用块内也可以包含 **格式** 和 `代码`。

```text
使用 text 或 plaintext 可避免语言解析问题
例如：startLine:endLine:filepath 这类格式
```

---

## 12. HTML 标签（如支持）

<details>
<summary>点击展开</summary>

这里是折叠内容。

</details>

---

*文档结束 — 用于测试 Markdown 组件渲染*
