exports.onCreateNode = async function onCreateNode({
  node,
  actions,
  loadNodeContent,
  createNodeId
}) {
  const {createNode, createParentChildLink} = actions;

  // We only care about plain text content.
  if (node.internal.mediaType !== `text/plain`) {
    return;
  }

  const textNode = {
    id: createNodeId(`${node.id} >> TextFile`),
    parent: node.id,
    content: await loadNodeContent(node),
    name: node.name,
    internal: {
      contentDigest: node.internal.contentDigest,
      type: 'TextFile'
    }
  };

  createNode(textNode);
  createParentChildLink({parent: node, child: textNode});
};

exports.sourceNodes = ({actions}) => {
  const {createTypes} = actions;

  if (createTypes) {
    createTypes(`
      type TextFile implements Node @infer @childOf(types: ["File"]) {
        id: ID!
        name: String!
        content: String!
      }
    `);
  }
};
