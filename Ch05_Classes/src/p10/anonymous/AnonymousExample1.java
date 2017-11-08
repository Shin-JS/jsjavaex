package p10.anonymous;
/** [무명객체]
 * 
 **/
public class AnonymousExample1 {
	public static void main(String[] args) {
		//객체 생성
		Anonymous anony = new Anonymous();
		//익명객체 필드 사용
		anony.field.wake();
		//익명객체 로컬 변수 사용
		anony.method1();
		//익명객체 매개값사용
		anony.method2(new Person() {
			void study() {
				System.out.println("적당한 휴식");
			}
			@Override
			void wake() {
				System.out.println("ㅇㅇㅇㅇㅇㅇ");
			};
		});
		
	}
}
