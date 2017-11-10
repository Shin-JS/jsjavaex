package p01.standard;
/**[API]
 * clone()메소드: 객체의 복제 기능 담당, 복제가능한 객체는 Cloneable인터페이스를 구현해야 함
 **/
public class NewMemberCloneExample {
	public static void main(String[] args) {
		//원본객체 생성
		NewMember origin = new NewMember("Go","고길동","1234",40,true);
		NewMember cloned = origin.getMember();
		cloned.password="4321";
		System.out.println(cloned.password);
		System.out.println(origin.password);
	}
}
