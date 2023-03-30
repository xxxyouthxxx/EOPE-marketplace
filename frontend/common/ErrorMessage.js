/*
[常见错误]
-这些是当函数未正确处理时返回的错误消息的常见异常处理内容。
*/
export function onResponse(err) {
  const errMsg = err.response.data.message;
  alert(`오류가 발생하였습니다. 관리자에게 문의해주세요.\n\n${errMsg}`);
}

export function onContractCall() {
  alert('컨트랙트 호출에 실패하였습니다.');
}

export function onInvalidAddress() {
  alert('유효한 주소를 입력해주세요.');
}
