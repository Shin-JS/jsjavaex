package p03.singletone;
/** [싱글톤]
 * 
 **/
public class SingletoneExample1 {
	public static void main(String[] args) {
//		SingleTon obj1 = new SingleTon(); //이러한 방법으로 접근 불가능 왜? private니까..
		SingleTon obj2 = SingleTon.getInstance(); //이렇게 접근해야함
		SingleTon obj3 = SingleTon.getInstance();
		
		if(obj2==obj3) {
			System.out.println("같은 Singletone객체입니다.");
		}else {
			System.out.println("다른 Singletone객체입니다.");
		}
	}
}
