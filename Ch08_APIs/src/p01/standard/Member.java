package p01.standard;
/**[API]
 * 
 * Object클래스의 equals()메소드의 용도는 객체의 비교시에는 동일한 객체인지 아닌지 비교하는 용도보다는 객체의 내용이 같은지를 비교하는 용도로 사용됨
 * 
 **/
public class Member extends Object{
	//필드
	public String id;
	//생성자
	Member(String id){
		this.id = id;
	}
	//메소드
	@Override
	public boolean equals(Object obj) {
		//1.동일한 객체인지 확인
		if(obj instanceof Member) {
			Member member = (Member)obj; //객체가 동일한 타입이라면
			if(id.equals(member.id)) {//객체의 필드값도 동일한지 체크
				return true; //비교대상이 동일한 객체라고 봄(논리적 동등)
			}
		}
		return false; //동일한 타입이 아니면 다른 객체로 봄
	}
}
