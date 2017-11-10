package p01.standard;
/**[API]
 * 
 **/
public class StudentExample {
	public static void main(String[] args) {
		Student student1 = new Student("고길동", 1);
		Student student2 = new Student("고길동", 1);
		System.out.println(student1.name.hashCode());
		System.out.println(student2.name.hashCode());
		
		//
		if(student1.name.equals(student2.name)&&student1.sno==student2.sno) {
			System.out.println("동일인물");
		}else {
			System.out.println("다른인물");
		}
	}
}
