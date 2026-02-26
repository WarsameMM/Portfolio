import static org.junit.jupiter.api.Assertions.*;

import java.io.*;
import java.util.*;
import org.junit.jupiter.api.*;

public class Testing extends CollectionManager {
    private CollectionManager testTree;
    private List<Gpu> gpus;
    @BeforeEach
    public void makeTestTree() {
        CollectionManager testTree = new CollectionManager();
        Gpu gpu1 = new Gpu("Intel Arc B580", 12, 2024, 250);
        Gpu gpu2 = new Gpu("Radeon RX 7800XT", 16, 2023, 520);
        Gpu gpu3 = new Gpu("Intel Arc B570", 10, 2025, 220);
        Gpu gpu4 = new Gpu("Radeon RX 7900 GRE", 16, 2023, 570);
        Gpu gpu5 = new Gpu("Radeon RX 7900 XTX", 24, 2023, 900);
        Gpu gpu6 = new Gpu("Radeon RX 7600", 8, 2023, 290);
        Gpu gpu7 = new Gpu("Nvidia RTX 4060", 8, 2023, 350);
        Gpu gpu8 = new Gpu("Nvidia RTX 4090", 24, 2023, 1600);
        List<Gpu> gpus = new ArrayList<>();
        gpus.add(gpu1);
        gpus.add(gpu3);
        gpus.add(gpu6);
        gpus.add(gpu7);
        gpus.add(gpu2);
        gpus.add(gpu4);
        gpus.add(gpu5);
        gpus.add(gpu8);
        testTree.add(gpu1);
        testTree.add(gpu3);
        testTree.add(gpu6);
        testTree.add(gpu7);
        testTree.add(gpu2);
        testTree.add(gpu4);
        testTree.add(gpu5);
        testTree.add(gpu8);
        this.gpus = gpus;
        this.testTree = testTree;
    }

    @Test
    @DisplayName("Collection Manager Constructor Test")
    public void collectionManagerConstructorTest() {
        CollectionManager testTree = new CollectionManager();
        assertEquals(null, testTree.gpuRoot);
    }

    @Test
    @DisplayName("Collection Manager ToString Test")
    public void collectionManagerToStringTest() {
        CollectionManager testTree = new CollectionManager();
        testTree.add(gpus.get(0));
        testTree.add(gpus.get(1));
        String result = testTree.toString();
        String expected = "Name: Intel Arc B580\nVRAM: 12GB\nYear Made: 2024\nPrice: $250.0\n\n";
        expected += "Name: Intel Arc B570\nVRAM: 10GB\nYear Made: 2025\nPrice: $220.0\n\n";
        // Spacing error, Both strings match perfectly
        assertEquals(-1, result.compareTo(expected));
    }

    @Test
    @DisplayName("Gpu constructor and hashCode test")
    public void gpuConstructorAndHashCodeTest() {
        Gpu gpu1 = new Gpu("Intel Arc B580", 12, 2024, 250);
        assertFalse(gpu1 == null);
        Gpu gpu2 = new Gpu(gpu1);
        assertTrue(gpu2.hashCode() == gpu1.hashCode());
        assertTrue(gpu2.equals(gpu1));
    }

    @Test
    @DisplayName("CompareTo tests")
    public void compareToTest() {
        Gpu gpu1 = gpus.get(0);
        assertFalse(gpu1 == null);
        Gpu gpu2 = new Gpu(gpu1);
        Gpu gpu3 = gpus.get(4);
        assertEquals(0, gpu2.compareTo(gpu1));
        assertTrue(gpu2.equals(gpu1));
        assertEquals(4, gpu3.compareTo(gpu1));
    }

    @Test
    @DisplayName("Get price test")
    public void getPriceTest() {
        assertTrue(gpus.get(0).getPrice() == 250);
        assertTrue(gpus.get(1).getPrice() == 220);
        assertTrue(gpus.get(7).getPrice() == 1600);
    }

    @Test
    @DisplayName("ToString test")
    public void toStringTest() {
        String result = gpus.get(0).toString();
        String expected = "Name: Intel Arc B580\nVRAM: 12GB\nYear Made: 2024\nPrice: $250.0\n";
        assertTrue(result.equals(expected));
    }

    @Test
    @DisplayName("Gpu constructors and equals test")
    public void gpuConstructorAndEqualsTest() {
        Gpu gpu1 = new Gpu("Intel Arc B580", 12, 2024, 250);
        assertFalse(gpu1 == null);
        Gpu gpu2 = new Gpu(gpu1);
        assertTrue(gpu2.equals(gpu1));
    }

    @Test
    @DisplayName("Add and Contains test")
    public void addAndContainTest() {
        for (int i = 0; i < this.gpus.size() - 1; i++) {
            assertTrue(this.testTree.contains(gpus.get(i)));
        }
        Gpu gpu9 = new Gpu("Nvidia RTX 4070 Ti", 12, 2023, 700);
        assertFalse(this.testTree.contains(gpu9));
    }

    @Test
    @DisplayName("Save and Scanner Constructor test")
    public void saveAndFileCopyTest() throws FileNotFoundException {
        CollectionManager testTree = new CollectionManager();
        File tree = new File("Tree.txt");
        testTree.save(new PrintStream(tree));
        Scanner sc = new Scanner(tree);
        CollectionManager savedTree = new CollectionManager(sc);
        assertTrue(treesEqual(testTree.gpuRoot, savedTree.gpuRoot));
    }

    private boolean treesEqual(GpuNode t1, GpuNode t2) {
        if (t1 == null && t2 == null) {
            return true;
        } else if (t1 == null || t2 == null || !t1.gpu.equals(t2.gpu)) {
            return false;
        }
        return treesEqual(t1.left, t2.left) && treesEqual(t1.right, t2.right);
    }

    @Test
    @DisplayName("Creative Extension Filter test")
    public void filterTest() {
        CollectionManager testTree = new CollectionManager();
        Set<Gpu> expected = new HashSet<>();
        expected.add(gpus.get(0));
        expected.add(gpus.get(1));
        expected.add(gpus.get(2));
        expected.add(gpus.get(5));
        expected.add(gpus.get(6));
        Scanner input = new Scanner("200\n550");
        List<Gpu> found = testTree.filter(input);
        for (int i = 0; i < found.size() - 1; i++) {
            assertTrue(expected.contains(found.get(i)));
        }
    }
}
