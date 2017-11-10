package p01.standard;
/**[API]
 * 
 **/
public class MemberExample1 {
	public static void main(String[] args) {
		Member obj1 = new Member("blue");
		Member obj2 = new Member("blue");
		Member obj3 = new Member("red");
		
		if(obj1.equals(obj2)) {
			System.out.println("obj1과 obj2는 논리적으로 동등");
		}else {
			System.out.println("obj1과 obj2는 논리적으로 다름");
		}
		if(obj1.equals(obj3)) {
			System.out.println("obj1과 obj3는 논리적으로 동등");
		}else {
			System.out.println("obj1과 obj3는 논리적으로 다름");
		}
		
	}
}
