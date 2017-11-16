package p04.set;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

/**[List 컬렉션]
 * Set - HashSet
 **/
public class LottoExample {
	public static void main(String[] args) {
		Set<Integer> set = new HashSet<>();
		while(set.size()<6) {
			int ran = (int) ((Math.random()*45)+1);
			set.add(ran);
		}
		Iterator<Integer> iterator = set.iterator();
		while(iterator.hasNext()) {
			System.out.println(iterator.next());
		}
	}
}
